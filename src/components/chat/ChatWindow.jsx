import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, Database, Brain } from "lucide-react";
import clsx from "clsx";
import { MessageBubble } from "./MessageBubble";
import { PersonaAvatarAnimated } from "./PersonaAvatarAnimated";
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

  // Smooth auto-scroll only if user is near bottom of chat stream
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
    <div className="flex flex-col h-full relative bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-300 font-sans">


      {/* Editorial Reading Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 relative z-10"
        role="log"
        aria-live="polite"
        aria-label="Conversation stream"
      >
        <div className="max-w-[760px] mx-auto w-full space-y-8 pb-36">
          {isEmpty ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center"
            >
              <PersonaAvatarAnimated
                persona={persona}
                size="xl"
                isTyping={false}
                showName
              />

              {persona?.greeting && (
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed max-w-lg font-serif italic">
                  "{persona.greeting}"
                </p>
              )}

              {persona?.suggestedPrompts?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-2">
                  {persona.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleStartChat(prompt)}
                      className="px-4 py-2 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-left shadow-sm cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* Reading Message List */
            <div className="space-y-8">
              {messages.map((msg, i) => {
                const isLastPersonaMsg =
                  msg.role === "persona" && i === messages.length - 1;

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

      {/* Floating Composer */}
      <div className="flex-shrink-0 relative z-20 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/90 to-transparent pt-4 pb-4">
        <div className="max-w-[760px] mx-auto w-full px-4">
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            persona={persona}
          />
        </div>
      </div>

      {/* Source Citation Modal */}
      <SourcePickerModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        initialTab="pdf"
      />
    </div>
  );
}

export default ChatWindow;
