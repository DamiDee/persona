// ============================================================
// useChatStore — Zustand Chat State
// Manages conversations, messages, streaming, and active persona.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockChats } from "../data/mockChats";
import { mockPersonas } from "../data/mockPersonas";
import { chatApi } from "../lib/mockApi";

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: mockChats,
      activeConversationId: null,
      activePersonaId: null,
      isStreaming: false,
      streamingMessageId: null,
      sidebarCollapsed: false,
      personaInfoOpen: false,

      // --- Selectors ---
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) || null;
      },

      getActivePersona: () => {
        const { activePersonaId } = get();
        return mockPersonas.find((p) => p.id === activePersonaId) || null;
      },

      // --- Actions ---
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
        const persona = mockPersonas.find((p) => p.id === personaId);
        const newChat = {
          id: `chat-${generateId()}`,
          personaId,
          title: `Chat with ${persona?.name || "Persona"}`,
          lastMessage: "",
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          conversations: [newChat, ...state.conversations],
          activeConversationId: newChat.id,
          activePersonaId: personaId,
        }));
        return newChat.id;
      },

      sendMessage: async (content) => {
        const { activeConversationId, activePersonaId, conversations } = get();
        if (!activeConversationId || !activePersonaId || !content.trim()) return;

        const userMessage = {
          id: `msg-${generateId()}`,
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        const streamingMsgId = `msg-${generateId()}`;
        const streamingMessage = {
          id: streamingMsgId,
          role: "persona",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        // Add user message + placeholder streaming message
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  messages: [...c.messages, userMessage, streamingMessage],
                  lastMessage: content.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          isStreaming: true,
          streamingMessageId: streamingMsgId,
        }));

        // Stream response
        try {
          const stream = chatApi.streamMessage(activePersonaId, content);
          let fullContent = "";

          for await (const chunk of stream) {
            fullContent += chunk;
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.id === activeConversationId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, content: fullContent }
                          : m
                      ),
                    }
                  : c
              ),
            }));
          }

          // Finalize
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === streamingMsgId
                        ? { ...m, isStreaming: false, content: fullContent }
                        : m
                    ),
                    lastMessage: fullContent.slice(0, 80) + "...",
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
            isStreaming: false,
            streamingMessageId: null,
          }));
        } catch (err) {
          set({ isStreaming: false, streamingMessageId: null });
          console.error("Stream error:", err);
        }
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
    }),
    {
      name: "persona-chats",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activePersonaId: state.activePersonaId,
      }),
    }
  )
);
