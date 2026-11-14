import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, GitCompareArrows, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import SourcePickerModal from "../home/SourcePickerModal";
import { useChatStore } from "../../store/useChatStore";
import { useNavigate } from "react-router-dom";

export function ChatWindow({ persona, conversation }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const { sendMessage, isStreaming, createNewChat, regenerateLastPersonaMessage } = useChatStore();
  const navigate = useNavigate();

  const messages = conversation?.messages || [];
  const sourceCount = persona?.sourceMaterial?.reduce((total, source) => total + source.count, 0) || 0;
  const starterModes = [
    { label: "Explore an idea", icon: Sparkles },
    { label: "Trace a teaching", icon: SearchCheck },
    { label: "Compare perspectives", icon: GitCompareArrows },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 200;

    if (isNearBottom || messages.length === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isStreaming]);

  const handleSend = (content) => {
    sendMessage(content);
  };

  const handleStartChat = (prompt) => {
    if (!conversation) {
      const chatId = createNewChat(persona?.id);
      navigate(`/app/chat/${chatId}`);
      setTimeout(() => sendMessage(prompt), 100);
    } else {
      sendMessage(prompt);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-300 font-sans">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_-12%,var(--color-accent-subtle),transparent_64%)] pointer-events-none" />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 relative z-10"
        role="log"
        aria-live="polite"
        aria-label="Conversation stream"
      >
        <div className="max-w-[860px] mx-auto w-full pb-40">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[calc(100dvh-154px)] py-9 sm:py-14 flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-[106px] h-[106px] flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--color-accent)] blur-[42px] opacity-15 rounded-full scale-125" />
                <div className="ai-orb absolute inset-2" />
                <div className="absolute inset-[14px] rounded-full border border-white/35 bg-[var(--color-bg-elevated)]/30 backdrop-blur-sm" />
                <img
                  src={persona?.avatar}
                  alt=""
                  className="relative z-10 w-14 h-14 rounded-full object-cover object-top border-2 border-white/60 shadow-lg"
                />
                <span className="absolute z-20 right-1 bottom-2 w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              <div className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px] font-bold tracking-[0.13em] uppercase text-[var(--color-text-secondary)] shadow-sm">
                <Sparkles size={12} className="text-[var(--color-accent)]" />
                Conversation with {persona?.name || "Persona"}
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl sm:text-[44px] leading-[1.04] tracking-[-0.045em] font-extrabold text-[var(--color-text-primary)]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] via-violet-400 to-pink-400">
                  Hello, I’m {persona?.name?.split(" ")[0] || "Persona"}.
                </span>
                What would you like to understand?
              </h1>

              {persona?.greeting && (
                <p className="mt-4 text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
                  Ask a detailed question and I’ll connect the answer to verified source material.
                </p>
              )}

              <div className="mt-7 w-full max-w-[720px] text-left">
                <ChatInput
                  onSend={handleSend}
                  onOpenSources={() => setIsSourceModalOpen(true)}
                  disabled={isStreaming}
                  persona={persona}
                  sourceCount={sourceCount}
                />
              </div>

              <div className="mt-6 w-full max-w-[720px] grid sm:grid-cols-3 gap-3 text-left">
                {persona?.suggestedPrompts?.slice(0, 3).map((prompt, index) => {
                  const mode = starterModes[index];
                  const ModeIcon = mode.icon;

                  return (
                  <motion.button
                    key={prompt}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.05 }}
                    onClick={() => handleStartChat(prompt)}
                    className="group min-h-[128px] rounded-[22px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] p-4 flex flex-col justify-between gap-5 text-sm font-medium text-[var(--color-text-primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span className="w-full flex items-center justify-between gap-3">
                      <span className="w-9 h-9 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center">
                        <ModeIcon size={15} />
                      </span>
                      <ArrowUpRight size={14} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-[var(--color-text-primary)]">{mode.label}</span>
                      <span className="block mt-1 text-[11px] leading-relaxed text-[var(--color-text-tertiary)] line-clamp-2">{prompt}</span>
                    </span>
                  </motion.button>
                  );
                })}
              </div>

              <div className="mt-7 flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-[11px] font-medium text-[var(--color-text-tertiary)]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={12} /> {sourceCount} curated sources
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Citations available
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10 pt-10 sm:pt-14">
              <div className="pb-5 border-b border-[var(--color-border)] flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Active conversation
                  </p>
                  <h1 className="mt-1.5 text-lg sm:text-xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                    {conversation?.title || `Conversation with ${persona?.name}`}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSourceModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                  <BookOpen size={12} className="text-[var(--color-accent)]" />
                  {sourceCount} sources
                </button>
              </div>

              {messages.map((msg, index) => {
                const isLastPersonaMsg = msg.role === "persona" && index === messages.length - 1;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    persona={persona}
                    isLastPersonaMessage={isLastPersonaMsg}
                    onOpenSources={() => setIsSourceModalOpen(true)}
                    onRegenerate={regenerateLastPersonaMessage}
                  />
                );
              })}
            </div>
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {!isEmpty && (
        <div className="flex-shrink-0 relative z-20 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)] via-80% to-transparent pt-7 pb-3 sm:pb-4">
          <div className="max-w-[860px] mx-auto w-full px-4 sm:px-8">
            <ChatInput
              onSend={handleSend}
              onOpenSources={() => setIsSourceModalOpen(true)}
              disabled={isStreaming}
              persona={persona}
              sourceCount={sourceCount}
            />
            <p className="mt-2 text-center text-[10px] text-[var(--color-text-tertiary)]">
              Persona can make mistakes. Review cited sources for important decisions.
            </p>
          </div>
        </div>
      )}

      <SourcePickerModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        initialTab="pdf"
      />
    </div>
  );
}

export default ChatWindow;
