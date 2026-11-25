// ============================================================
// useChatStore — Zustand Chat & Modal Serving API State (with RAG Sources)
// Manages conversations, SSE streaming (/v1/chat), GPU warmup (/v1/warmup),
// persona registry discovery (/v1/personas), and health checks (/health).
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockChats } from "../data/mockChats";
import {
  mockPersonas,
  getPersonaById,
  resolveApiPersonaId,
} from "../data/mockPersonas";
import { getFallbackSermonSources } from "../data/selmanSermons";
import { chatApi } from "../lib/mockApi";
import {
  streamPersonaChat,
  warmupPersonaGpu,
  fetchRemotePersonas,
  checkApiHealth,
  checkServerProxyStatus,
  getStoredApiKey,
  setStoredApiKey,
  setStoredBaseUrl,
} from "../lib/personaApi";
import { useAuthStore } from "./useAuthStore";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// GPU stays warm for 5 minutes after the last request on Modal
export const GPU_WARM_WINDOW_MS = 5 * 60 * 1000;

let activeAbortController = null;
let warmupInFlight = null;

function buildConversationTitle(content, personaName) {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return `Chat with ${personaName || "Persona"}`;
  if (cleaned.length <= 44) return cleaned;
  return `${cleaned.slice(0, 42).trim()}…`;
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: mockChats,
      activeConversationId: mockChats[0]?.id || null,
      activePersonaId: mockChats[0]?.personaId || "persona-01",
      personas: mockPersonas,
      remotePersonas: [],

      // Streaming state
      isStreaming: false,
      streamingMessageId: null,
      streamPhase: "idle", // "idle" | "connecting" | "cold_start" | "streaming"
      streamStartedAt: null,

      // Chat request parameters (from Handover spec)
      responseLength: "normal", // "short" | "normal" | "long"
      responseFormat: "markdown", // "markdown" | "plain"

      // Modal API & GPU state
      apiMode: "live", // "live" | "demo"
      useStreamProtocol: true, // true -> SSE text/event-stream, false -> single JSON reply
      healthStatus: "unknown", // "unknown" | "checking" | "healthy" | "unreachable"
      healthLatencyMs: null,
      warmupStatus: "idle", // "idle" | "warming" | "warm" | "auth_required" | "error"
      lastWarmupAt: null,
      warmupError: null,
      hasServerKey: false,
      apiKeyConfigured: Boolean(getStoredApiKey()),
      apiModalOpen: false,

      // Layout panels
      sidebarCollapsed: false,
      personaInfoOpen: false,

      // --- Selectors ---
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return (
          conversations.find((c) => c.id === activeConversationId) || null
        );
      },

      getActivePersona: () => {
        const {
          activePersonaId,
          personas,
          conversations,
          activeConversationId,
        } = get();
        const conv = conversations.find((c) => c.id === activeConversationId);
        const targetId = conv?.personaId || activePersonaId || "persona-01";
        return (
          personas.find(
            (p) => p.id === targetId || p.apiPersonaId === targetId
          ) ||
          getPersonaById(targetId) ||
          personas[0]
        );
      },

      isGpuCurrentlyWarm: () => {
        const { lastWarmupAt, warmupStatus } = get();
        if (warmupStatus !== "warm" || !lastWarmupAt) return false;
        return Date.now() - lastWarmupAt < GPU_WARM_WINDOW_MS;
      },

      // --- Request Parameter Actions ---
      setResponseLength: (length) => {
        if (["short", "normal", "long"].includes(length)) {
          set({ responseLength: length });
        }
      },

      setResponseFormat: (format) => {
        if (["markdown", "plain"].includes(format)) {
          set({ responseFormat: format });
        }
      },

      // --- API Configuration & Diagnostics ---
      setApiModalOpen: (open) => set({ apiModalOpen: Boolean(open) }),

      setApiMode: (mode) => set({ apiMode: mode === "demo" ? "demo" : "live" }),

      setUseStreamProtocol: (enabled) =>
        set({ useStreamProtocol: Boolean(enabled) }),

      saveApiCredentials: async ({ apiKey, baseUrl, apiMode }) => {
        if (typeof apiKey === "string") {
          setStoredApiKey(apiKey);
        }
        if (typeof baseUrl === "string") {
          setStoredBaseUrl(baseUrl);
        }
        if (apiMode) {
          set({ apiMode });
        }
        const proxyStatus = await checkServerProxyStatus();
        const hasKey = Boolean(getStoredApiKey() || proxyStatus.hasServerKey);
        set({
          hasServerKey: proxyStatus.hasServerKey,
          apiKeyConfigured: hasKey,
        });

        get().checkHealth();
        if (hasKey) {
          get().syncPersonas();
          get().warmupGpu({ force: true });
        }
      },

      checkHealth: async () => {
        set({ healthStatus: "checking" });
        const [proxyStatus, health] = await Promise.all([
          checkServerProxyStatus(),
          checkApiHealth(),
        ]);
        const hasKey = Boolean(getStoredApiKey() || proxyStatus.hasServerKey);
        set({
          hasServerKey: proxyStatus.hasServerKey,
          apiKeyConfigured: hasKey,
          healthStatus: health.ok ? "healthy" : "unreachable",
          healthLatencyMs: health.latencyMs,
        });
        return health;
      },

      /**
       * POST /v1/warmup — Wakes the Modal L40S GPU when the chat page opens.
       * Returns {"ready": true} once the model is up (can take up to ~4 minutes).
       */
      warmupGpu: async ({ force = false } = {}) => {
        const { isGpuCurrentlyWarm, apiMode } = get();
        if (apiMode === "demo") return { ok: true, skipped: true };
        if (!force && isGpuCurrentlyWarm()) {
          return { ok: true, cached: true };
        }
        if (warmupInFlight) {
          return warmupInFlight;
        }

        set({ warmupStatus: "warming", warmupError: null });

        warmupInFlight = (async () => {
          try {
            const res = await warmupPersonaGpu();
            set({
              warmupStatus: res?.ready !== false ? "warm" : "warming",
              lastWarmupAt: Date.now(),
              warmupError: null,
              healthStatus: "healthy",
            });
            return res;
          } catch (err) {
            if (err?.code === "AUTH_REQUIRED") {
              set({
                warmupStatus: "auth_required",
                warmupError: "API key required for GPU warmup",
              });
            } else {
              set({
                warmupStatus: "error",
                warmupError: err?.message || "Warmup failed",
              });
            }
            return { ok: false, error: err };
          } finally {
            warmupInFlight = null;
          }
        })();

        return warmupInFlight;
      },

      /**
       * GET /v1/personas — Fetches registered personas from Modal API and merges with UI catalog.
       */
      syncPersonas: async () => {
        try {
          const remoteList = await fetchRemotePersonas();
          if (!Array.isArray(remoteList) || remoteList.length === 0) return;

          set((state) => {
            const updatedPersonas = state.personas.map((p) => {
              const match = remoteList.find((r) => {
                const rId =
                  typeof r === "string" ? r : r.id || r.persona || r.slug;
                return rId === p.apiPersonaId || rId === p.id;
              });
              if (match) {
                const remoteObj =
                  typeof match === "object" ? match : { id: match };
                return {
                  ...p,
                  isLiveAdapter: true,
                  remoteMeta: remoteObj,
                };
              }
              return p;
            });

            for (const item of remoteList) {
              const rId =
                typeof item === "string"
                  ? item
                  : item?.id || item?.persona || item?.slug;
              if (!rId) continue;
              const exists = updatedPersonas.some(
                (p) => p.apiPersonaId === rId || p.id === rId
              );
              if (!exists) {
                const name =
                  (typeof item === "object" &&
                    (item.name || item.display_name)) ||
                  rId.toUpperCase();
                updatedPersonas.push({
                  id: `persona-${rId}`,
                  apiPersonaId: rId,
                  adapterName: `${rId} (LoRA · L40S)`,
                  isLiveAdapter: true,
                  name,
                  tagline:
                    (typeof item === "object" && item.description) ||
                    "Fine-Tuned Modal Persona",
                  category: "faith",
                  bio:
                    (typeof item === "object" && item.bio) ||
                    `Live fine-tuned LoRA persona adapter (${rId}) served via Modal vLLM.`,
                  longBio:
                    (typeof item === "object" && item.system_prompt) ||
                    `Connected directly to the '${rId}' adapter on the Modal serving pipeline.`,
                  sourceMaterial: [{ type: "Sermons", count: 657 }],
                  isPremium: false,
                  avatar: "/avatar-selman.png",
                  avatarGradient: ["#0891b2", "#0e7490"],
                  accentColor: "#06b6d4",
                  suggestedPrompts: [
                    "How do I grow in prayer?",
                    "What principle should guide my decisions today?",
                    "Share a foundational teaching with me",
                  ],
                  greeting: `Peace to you. What is on your heart today — what would you like to understand more deeply?`,
                });
              }
            }

            return {
              remotePersonas: remoteList,
              personas: updatedPersonas,
            };
          });
        } catch {
          // Silently keep local catalog if unauthorized or offline
        }
      },

      // --- Conversation Actions ---
      setActiveConversation: (conversationId) => {
        const { conversations } = get();
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          set({
            activeConversationId: conversationId,
            activePersonaId: conv.personaId,
          });
        }
      },

      setActivePersona: (personaId) => {
        set({ activePersonaId: personaId });
      },

      createNewChat: (personaId) => {
        const { personas, activePersonaId } = get();
        const resolvedPersonaId = personaId || activePersonaId || "persona-01";
        const persona =
          personas.find(
            (p) =>
              p.id === resolvedPersonaId || p.apiPersonaId === resolvedPersonaId
          ) || getPersonaById(resolvedPersonaId);

        const newChat = {
          id: `chat-${generateId()}`,
          personaId: persona?.id || "persona-01",
          title: `Chat with ${persona?.name || "Persona"}`,
          lastMessage: "",
          updatedAt: new Date().toISOString(),
          messages: [],
        };

        set((state) => ({
          conversations: [newChat, ...state.conversations],
          activeConversationId: newChat.id,
          activePersonaId: newChat.personaId,
        }));
        return newChat.id;
      },

      stopStreaming: () => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        const { activeConversationId, streamingMessageId } = get();
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  // If user stops before any text arrived, remove empty placeholder; otherwise keep partial
                  messages: c.messages
                    .map((m) =>
                      m.id === streamingMessageId
                        ? m.content
                          ? {
                              ...m,
                              isStreaming: false,
                              finishReason: "stopped",
                            }
                          : null
                        : m
                    )
                    .filter(Boolean),
                }
              : c
          ),
          isStreaming: false,
          streamingMessageId: null,
          streamPhase: "idle",
          streamStartedAt: null,
        }));
      },

      /**
       * Sends a user message and streams the reply + RAG sermon sources from POST /v1/chat.
       */
      sendMessage: async (content, { forceDemo = false } = {}) => {
        const trimmed = typeof content === "string" ? content.trim() : "";
        if (!trimmed) return;

        let {
          activeConversationId,
          activePersonaId,
          conversations,
          personas,
          apiMode,
          useStreamProtocol,
          responseLength,
          responseFormat,
        } = get();

        let targetConv = conversations.find(
          (c) => c.id === activeConversationId
        );
        if (!targetConv) {
          const newId = get().createNewChat(activePersonaId || "persona-01");
          activeConversationId = newId;
          conversations = get().conversations;
          targetConv = conversations.find((c) => c.id === newId);
        }

        const personaId =
          targetConv?.personaId || activePersonaId || "persona-01";
        const persona =
          personas.find(
            (p) => p.id === personaId || p.apiPersonaId === personaId
          ) ||
          getPersonaById(personaId) ||
          personas[0];

        const userMessage = {
          id: `msg-${generateId()}`,
          role: "user",
          content: trimmed,
          timestamp: new Date().toISOString(),
        };

        const streamingMsgId = `msg-${generateId()}`;
        const apiPersonaSlug = resolveApiPersonaId(persona);
        const streamingMessage = {
          id: streamingMsgId,
          role: "persona",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
          modelPersona: apiPersonaSlug,
          sources: [],
          usedContext: false,
          finishReason: null,
          guardrail: null,
        };

        const existingCleanMessages = (targetConv?.messages || []).filter(
          (m) => !m.isError && !m.isStreaming
        );
        const isFirstUserMessage =
          existingCleanMessages.filter((m) => m.role === "user").length === 0;
        const nextTitle = isFirstUserMessage
          ? buildConversationTitle(trimmed, persona?.name)
          : targetConv.title;

        const updatedMessagesForHistory = [
          ...existingCleanMessages,
          userMessage,
        ];

        const startedAt = Date.now();
        const isWarm = get().isGpuCurrentlyWarm();

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  title: nextTitle,
                  messages: [
                    ...existingCleanMessages,
                    userMessage,
                    streamingMessage,
                  ],
                  lastMessage: trimmed,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          isStreaming: true,
          streamingMessageId: streamingMsgId,
          streamPhase: isWarm ? "connecting" : "connecting",
          streamStartedAt: startedAt,
        }));

        if (activeAbortController) {
          activeAbortController.abort();
        }
        const abortController = new AbortController();
        activeAbortController = abortController;

        // Cold-start timer: `start` arrives immediately even while the model is waking;
        // if first `delta` takes > 3.5s, transition streamPhase to "cold_start"
        const coldStartTimer = setTimeout(() => {
          const current = get();
          if (
            current.isStreaming &&
            current.streamingMessageId === streamingMsgId &&
            current.streamPhase === "connecting"
          ) {
            set({ streamPhase: "cold_start" });
          }
        }, 3500);

        const useMock = forceDemo || apiMode === "demo";

        try {
          let fullContent = "";
          let firstTokenAt = null;
          let tokenCount = 0;
          let finishReason = "stop";
          let usedContext = false;
          let guardrail = null;
          let retrievedSources = [];
          let resolvedModelPersona = apiPersonaSlug;

          if (useMock) {
            retrievedSources = getFallbackSermonSources(
              trimmed,
              persona?.id || apiPersonaSlug
            );
            usedContext = retrievedSources.length > 0;

            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.id === activeConversationId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, sources: retrievedSources, usedContext }
                          : m
                      ),
                    }
                  : c
              ),
            }));

            const stream = chatApi.streamMessage(personaId, trimmed);
            for await (const chunk of stream) {
              if (abortController.signal.aborted) break;
              if (!firstTokenAt) {
                firstTokenAt = Date.now();
                clearTimeout(coldStartTimer);
                set({ streamPhase: "streaming" });
              }
              fullContent += chunk;
              tokenCount += 1;
              set((state) => ({
                conversations: state.conversations.map((c) =>
                  c.id === activeConversationId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === streamingMsgId
                            ? {
                                ...m,
                                content: fullContent,
                                sources: retrievedSources,
                                isDemoResponse: true,
                              }
                            : m
                        ),
                      }
                    : c
                ),
              }));
            }
          } else {
            const authUser = useAuthStore.getState()?.user;
            const sseStream = streamPersonaChat({
              persona: apiPersonaSlug,
              messages: updatedMessagesForHistory,
              userId: authUser?.id || authUser?.email || undefined,
              stream: useStreamProtocol,
              length: responseLength,
              format: responseFormat,
              signal: abortController.signal,
            });

            for await (const event of sseStream) {
              if (abortController.signal.aborted) break;

              if (event.type === "start") {
                // `start` arrives immediately, even while the model is waking.
                // Keep waiting indicator up until first `delta` arrives.
                resolvedModelPersona = event.persona || apiPersonaSlug;
                set({ healthStatus: "healthy" });
              } else if (event.type === "sources") {
                // `sources` arrives after retrieval, before any `delta` text
                retrievedSources = Array.isArray(event.sources)
                  ? event.sources
                  : [];
                usedContext = retrievedSources.length > 0;

                set((state) => ({
                  conversations: state.conversations.map((c) =>
                    c.id === activeConversationId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === streamingMsgId
                              ? {
                                  ...m,
                                  sources: retrievedSources,
                                  usedContext,
                                }
                              : m
                          ),
                        }
                      : c
                  ),
                }));
              } else if (
                event.type === "delta" &&
                typeof event.text === "string"
              ) {
                if (!firstTokenAt) {
                  firstTokenAt = Date.now();
                  clearTimeout(coldStartTimer);
                  set({
                    streamPhase: "streaming",
                    warmupStatus: "warm",
                    lastWarmupAt: Date.now(),
                    healthStatus: "healthy",
                  });
                }
                fullContent += event.text;
                tokenCount += Math.max(1, Math.round(event.text.length / 4));

                const elapsedSec = Math.max(
                  0.1,
                  (Date.now() - firstTokenAt) / 1000
                );
                const tokPerSec =
                  tokenCount > 2 ? Math.round(tokenCount / elapsedSec) : null;

                set((state) => ({
                  conversations: state.conversations.map((c) =>
                    c.id === activeConversationId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === streamingMsgId
                              ? {
                                  ...m,
                                  content: fullContent,
                                  sources: retrievedSources,
                                  modelPersona: resolvedModelPersona,
                                  ttftMs: firstTokenAt - startedAt,
                                  tokensPerSec: tokPerSec,
                                }
                              : m
                          ),
                        }
                      : c
                  ),
                }));
              } else if (event.type === "done") {
                finishReason = event.finish_reason || "stop";
                usedContext =
                  typeof event.used_context === "boolean"
                    ? event.used_context
                    : retrievedSources.length > 0;
                guardrail = event.guardrail || null;
              } else if (event.type === "error") {
                throw new Error(event.message || "Model generation failed.");
              }
            }
          }

          clearTimeout(coldStartTimer);

          const totalElapsedSec = firstTokenAt
            ? Math.max(0.15, (Date.now() - firstTokenAt) / 1000)
            : null;
          const finalTokPerSec =
            totalElapsedSec && tokenCount > 1
              ? Math.round(tokenCount / totalElapsedSec)
              : null;

          // Finalize assistant message
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === streamingMsgId
                        ? {
                            ...m,
                            isStreaming: false,
                            content: fullContent,
                            sources: retrievedSources,
                            modelPersona: resolvedModelPersona,
                            finishReason,
                            usedContext,
                            guardrail,
                            isDemoResponse: useMock,
                            ttftMs: firstTokenAt
                              ? firstTokenAt - startedAt
                              : null,
                            tokensPerSec: finalTokPerSec,
                          }
                        : m
                    ),
                    lastMessage:
                      fullContent.length > 88
                        ? `${fullContent.slice(0, 88)}...`
                        : fullContent,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
            isStreaming: false,
            streamingMessageId: null,
            streamPhase: "idle",
            streamStartedAt: null,
            ...(useMock
              ? {}
              : {
                  warmupStatus: "warm",
                  lastWarmupAt: Date.now(),
                  healthStatus: "healthy",
                }),
          }));
        } catch (err) {
          clearTimeout(coldStartTimer);
          if (err?.name === "AbortError") {
            return;
          }

          const isAuthError =
            err?.code === "AUTH_REQUIRED" ||
            err?.status === 401 ||
            err?.status === 403;

          // Handover rule: "On an error event, a non-200 status or a dropped connection,
          // show the message with a Retry button and do not save the half reply into the conversation."
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === streamingMsgId
                        ? {
                            ...m,
                            content: "", // Clear any half-streamed content so it is never saved
                            sources: [],
                            isStreaming: false,
                            isError: true,
                            isAuthError,
                            errorMessage:
                              err?.message ||
                              "Could not complete request to Persona API.",
                            promptContent: trimmed,
                          }
                        : m
                    ),
                  }
                : c
            ),
            isStreaming: false,
            streamingMessageId: null,
            streamPhase: "idle",
            streamStartedAt: null,
            ...(isAuthError ? { warmupStatus: "auth_required" } : {}),
          }));
        } finally {
          if (activeAbortController === abortController) {
            activeAbortController = null;
          }
        }
      },

      /**
       * Regenerates the last assistant response (or retries a failed message).
       * Never regenerates a crisis guardrail response.
       */
      regenerateLastPersonaMessage: async ({ forceDemo = false } = {}) => {
        const { activeConversationId, conversations, isStreaming } = get();
        if (isStreaming || !activeConversationId) return;

        const conv = conversations.find((c) => c.id === activeConversationId);
        if (!conv || !conv.messages.length) return;

        const lastMsg = conv.messages[conv.messages.length - 1];
        if (
          lastMsg &&
          (lastMsg.finishReason === "guardrail" ||
            lastMsg.guardrail === "crisis")
        ) {
          return;
        }

        const messagesCopy = [...conv.messages];
        while (
          messagesCopy.length > 0 &&
          messagesCopy[messagesCopy.length - 1].role !== "user"
        ) {
          messagesCopy.pop();
        }

        const lastUserMessage = messagesCopy.pop();
        if (!lastUserMessage) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? { ...c, messages: messagesCopy }
              : c
          ),
        }));

        await get().sendMessage(lastUserMessage.content, { forceDemo });
      },

      deleteChat: async (chatId) => {
        await chatApi.deleteChat(chatId);
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== chatId);
          return {
            conversations: remaining,
            activeConversationId:
              state.activeConversationId === chatId
                ? remaining[0]?.id || null
                : state.activeConversationId,
          };
        });
      },

      renameChat: async (chatId, newTitle) => {
        await chatApi.renameChat(chatId, newTitle);
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === chatId ? { ...c, title: newTitle } : c
          ),
        }));
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      togglePersonaInfo: () =>
        set((state) => ({ personaInfoOpen: !state.personaInfoOpen })),

      setPersonaInfoOpen: (open) => set({ personaInfoOpen: Boolean(open) }),
    }),
    {
      name: "persona-chats",
      version: 2,
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        if (Array.isArray(merged.conversations)) {
          merged.conversations = merged.conversations.map((conv) => ({
            ...conv,
            messages: Array.isArray(conv.messages)
              ? conv.messages.map((msg) => {
                  if (
                    msg.role !== "user" &&
                    !msg.isError &&
                    msg.finishReason !== "guardrail" &&
                    (!Array.isArray(msg.sources) || msg.sources.length === 0) &&
                    msg.content
                  ) {
                    return {
                      ...msg,
                      sources: getFallbackSermonSources(
                        msg.content,
                        conv.personaId
                      ),
                    };
                  }
                  return msg;
                })
              : [],
          }));
        }
        return merged;
      },
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activePersonaId: state.activePersonaId,
        apiMode: state.apiMode,
        useStreamProtocol: state.useStreamProtocol,
        responseLength: state.responseLength,
        responseFormat: state.responseFormat,
        lastWarmupAt: state.lastWarmupAt,
      }),
    }
  )
);
