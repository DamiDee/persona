// ChatWindow.jsx — Modern, ChatGPT & iMessage-inspired chat workspace connected to the Modal Persona Serving API

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Compass,
  Flame,
  GitCompareArrows,
  MessageSquarePlus,
  PanelRight,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { PersonaInspectorDrawer } from "./PersonaInspectorDrawer";
import { ApiConnectionModal } from "./ApiConnectionModal";
import { useChatStore } from "../../store/useChatStore";
import { resolveApiPersonaId } from "../../data/mockPersonas";
import { useNavigate } from "react-router-dom";

const STARTER_MODES = [
  { label: "Spiritual Growth", icon: Sparkles },
  { label: "Deep Principle", icon: SearchCheck },
  { label: "Practical Wisdom", icon: Compass },
  { label: "Perspective Shift", icon: GitCompareArrows },
];

export function ChatWindow({ persona, conversation }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    createNewChat,
    regenerateLastPersonaMessage,
    personaInfoOpen,
    togglePersonaInfo,
    setPersonaInfoOpen,
    apiModalOpen,
    setApiModalOpen,
    apiMode,
    warmupStatus,
  } = useChatStore();
  const navigate = useNavigate();

  const messages = conversation?.messages || [];
  const lastMsgContent = messages[messages.length - 1]?.content || "";
  const sourceCount =
    persona?.sourceMaterial?.reduce((total, source) => total + source.count, 0) ||
    657;
  const apiSlug = resolveApiPersonaId(persona);
  const isSelman = !persona || persona.id === "persona-01" || apiSlug === "ajs";

  // Track scroll position for "Jump to bottom" button and smooth auto-scroll during streaming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollBottom(distanceFromBottom > 240);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < 260 || messages.length <= 2) {
      bottomRef.current?.scrollIntoView({
        behavior: isStreaming ? "auto" : "smooth",
      });
    }
  }, [messages.length, lastMsgContent, isStreaming]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (content) => {
    if (!conversation) {
      const chatId = createNewChat(persona?.id || "persona-01");
      navigate(`/app/chat/${chatId}`, { replace: true });
      setTimeout(() => sendMessage(content), 20);
    } else {
      sendMessage(content);
    }
  };

  const isEmpty = messages.length === 0;
  const hasFailedAuthMsg = messages.some((m) => m.isError);

  return (
    <div className="flex h-full relative overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-300 font-sans">
      {/* Main Conversation Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Ambient radial light */}
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_50%_-15%,var(--color-accent-subtle),transparent_68%)] pointer-events-none" />

        {/* Conversation Sub-Toolbar (visible when messages exist) */}
        {!isEmpty && (
          <div className="flex-shrink-0 relative z-20 px-4 sm:px-8 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/80 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate">
                {conversation?.title || `Conversation with ${persona?.name}`}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-tertiary)]">
                <BookOpen size={10} className="text-[var(--color-accent)]" />
                {isSelman
                  ? "Grounded in 657 sermons"
                  : `Grounded in ${sourceCount} works`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const chatId = createNewChat(persona?.id || "persona-01");
                  navigate(`/app/chat/${chatId}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                title="Start fresh thread with this persona"
              >
                <MessageSquarePlus size={12} className="text-[var(--color-accent)]" />
                <span className="hidden sm:inline">New Thread</span>
              </button>

              <button
                type="button"
                onClick={togglePersonaInfo}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer",
                  personaInfoOpen
                    ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
                title="Toggle Mind & Pipeline Inspector"
              >
                <PanelRight size={13} />
                <span className="hidden md:inline">About</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Message Stream */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 relative z-10"
          role="log"
          aria-live="polite"
          aria-label="Conversation stream"
        >
          <div className="max-w-[780px] mx-auto w-full pb-36">
            {isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[calc(100dvh-130px)] py-8 sm:py-12 flex flex-col items-center justify-center text-center"
              >
                {/* Animated Orb + Persona Portrait */}
                <div className="relative w-[92px] h-[92px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-[var(--color-accent)] blur-[38px] opacity-20 rounded-full scale-125" />
                  <div className="ai-orb absolute inset-1.5" />
                  <div className="absolute inset-[11px] rounded-full border border-white/35 bg-[var(--color-bg-elevated)]/30 backdrop-blur-sm" />
                  <img
                    src={persona?.avatar || "/avatar-selman.png"}
                    alt={persona?.name || "Joshua Selman"}
                    className="relative z-10 w-14 h-14 rounded-full object-cover object-top border-2 border-white/75 shadow-lg"
                  />
                  <span
                    className="absolute z-20 right-1 bottom-1 w-4.5 h-4.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm"
                    title="Online"
                  >
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        warmupStatus === "warm"
                          ? "bg-emerald-500"
                          : warmupStatus === "warming"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-emerald-500"
                      )}
                    />
                  </span>
                </div>

                {/* Grounded in 657 Sermons Pill */}
                <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[11px] font-bold tracking-wide text-[var(--color-text-secondary)] shadow-sm">
                  <BookOpen size={12} className="text-[var(--color-accent)]" />
                  <span>{persona?.name || "Joshua Selman"}</span>
                  <span className="text-[var(--color-text-tertiary)]">·</span>
                  <span className="text-[var(--color-accent)]">
                    {isSelman
                      ? "Grounded in 657 sermons"
                      : `Grounded in ${sourceCount} works`}
                  </span>
                </div>

                {/* Clean Editorial Headline (without "Hello, I'm Joshua.") */}
                <h1 className="mt-4 max-w-2xl text-2xl sm:text-[38px] leading-[1.1] tracking-[-0.03em] font-extrabold text-[var(--color-text-primary)]">
                  What would you like to{" "}
                  <span className="font-serif italic font-normal text-[var(--color-accent)]">
                    understand
                  </span>{" "}
                  today?
                </h1>

                {persona?.greeting && (
                  <p className="mt-2.5 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-lg">
                    {persona.greeting}
                  </p>
                )}

                {/* Centered Prompt Composer */}
                <div className="mt-6 w-full max-w-[700px] text-left">
                  <ChatInput
                    onSend={handleSend}
                    onStop={stopStreaming}
                    disabled={isStreaming}
                    persona={persona}
                    sourceCount={sourceCount}
                  />
                </div>

                {/* Starter Inquiry Grid */}
                <div className="mt-5 w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {(persona?.suggestedPrompts || []).slice(0, 4).map((prompt, index) => {
                    const mode = STARTER_MODES[index % STARTER_MODES.length];
                    const ModeIcon = mode.icon;

                    return (
                      <motion.button
                        key={prompt}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + index * 0.04 }}
                        onClick={() => handleSend(prompt)}
                        className="group p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 flex items-start justify-between gap-3 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                            <ModeIcon size={14} />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                              {mode.label}
                            </span>
                            <span className="block mt-0.5 text-xs sm:text-[13px] font-semibold leading-snug text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                              {prompt}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={14}
                          className="shrink-0 mt-1 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors"
                        />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Trust & Pipeline Footer */}
                <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-[11px] font-medium text-[var(--color-text-tertiary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[var(--color-accent)]" />
                    <span>
                      {isSelman
                        ? "Grounded in 657 sermons"
                        : `Grounded in ${sourceCount} works`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setApiModalOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                  >
                    <Flame
                      size={12}
                      className={
                        warmupStatus === "warm"
                          ? "text-emerald-500"
                          : "text-[var(--color-accent)]"
                      }
                    />
                    <span>
                      {apiMode === "live"
                        ? warmupStatus === "warm"
                          ? "Modal GPU Warm (~2s)"
                          : warmupStatus === "warming"
                          ? "Warming Modal GPU..."
                          : "Live Persona Model"
                        : "Demo Simulation Mode"}
                    </span>
                  </button>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Safety Guardrails Active</span>
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 pt-6 sm:pt-8">
                {messages.map((msg, index) => {
                  const isLastPersonaMsg =
                    msg.role === "persona" && index === messages.length - 1;

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      persona={persona}
                      isLastPersonaMessage={isLastPersonaMsg}
                      onRegenerate={regenerateLastPersonaMessage}
                    />
                  );
                })}
              </div>
            )}
            <div ref={bottomRef} aria-hidden="true" />
          </div>
        </div>

        {/* Floating Jump-to-Bottom Button */}
        <AnimatePresence>
          {showScrollBottom && !isEmpty && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] shadow-lg text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-accent)] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDown size={13} className="text-[var(--color-accent)]" />
              <span>Latest response</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bottom Docked Composer (when conversation is active) */}
        {!isEmpty && (
          <div className="flex-shrink-0 relative z-20 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)] via-85% to-transparent pt-4 pb-3 sm:pb-4">
            <div className="max-w-[780px] mx-auto w-full px-4 sm:px-8">
              <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                disabled={isStreaming}
                persona={persona}
                sourceCount={sourceCount}
              />
              <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
                <span>
                  {isSelman
                    ? "Joshua Selman · Grounded in 657 sermons"
                    : `${persona?.name || "Persona"} · Grounded in ${sourceCount} works`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Slide-Over Mind & Pipeline Inspector */}
      <PersonaInspectorDrawer
        isOpen={personaInfoOpen}
        onClose={() => setPersonaInfoOpen(false)}
        persona={persona}
        onSelectPrompt={(prompt) => handleSend(prompt)}
      />

      {/* Modal Serving API & GPU Warmup Configuration Modal */}
      <ApiConnectionModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onRetryPendingMessage={
          hasFailedAuthMsg
            ? () => regenerateLastPersonaMessage({ forceDemo: false })
            : undefined
        }
      />
    </div>
  );
}

export default ChatWindow;
