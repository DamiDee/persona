// ChatWindow — message list with scroll-to-bottom, empty state, and background

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { MessageBubble } from "./MessageBubble";
import { PersonaAvatarAnimated } from "./PersonaAvatarAnimated";
import { ChatInput } from "./ChatInput";
import { Button } from "../ui/Button";
import { useChatStore } from "../../store/useChatStore";
import { useNavigate } from "react-router-dom";

export function ChatWindow({ persona, conversation }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const { sendMessage, isStreaming, createNewChat } = useChatStore();
  const navigate = useNavigate();

  const messages = conversation?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming]);

  const handleSend = (content) => {
    sendMessage(content);
  };

  const handleStartChat = (prompt) => {
    if (!conversation) {
      // Create a new conversation first
      const chatId = createNewChat(persona?.id);
      navigate(`/app/chat/${chatId}`);
      setTimeout(() => sendMessage(prompt), 100);
    } else {
      sendMessage(prompt);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Message area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 relative z-10"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
      >
        <div className="max-w-3xl mx-auto w-full space-y-6 pb-28">
          {isEmpty ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-8"
            >
              <PersonaAvatarAnimated
                persona={persona}
                size="xl"
                isTyping={false}
                showName
              />

              {/* Greeting */}
              {persona?.greeting && (
                <p className="text-center text-[var(--color-text-secondary)] text-[17px] leading-relaxed max-w-md">
                  "{persona.greeting}"
                </p>
              )}

              {/* Suggested prompts */}
              {persona?.suggestedPrompts?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {persona.suggestedPrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                      onClick={() => handleStartChat(prompt)}
                      className={clsx(
                        "glass rounded-[var(--radius-md)] px-4 py-2.5 text-[14px]",
                        "text-[var(--color-text-secondary)] border border-[var(--color-border)]",
                        "hover:border-[var(--color-border-strong)] hover:shadow-sm",
                        "transition-all duration-200 text-left"
                      )}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* Messages */
            <div className="space-y-6">
              {messages.map((msg, i) => {
                const isLastPersonaMsg =
                  msg.role === "persona" &&
                  i === messages.length - 1;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    persona={persona}
                    isLastPersonaMessage={isLastPersonaMsg}
                  />
                );
              })}
            </div>
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 relative z-20 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/95 to-transparent pt-6 pb-4">
        <div className="max-w-3xl mx-auto w-full px-4">
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            persona={persona}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
