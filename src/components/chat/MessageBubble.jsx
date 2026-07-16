// MessageBubble — individual chat message (user right / persona left)
// Supports streaming state and typewriter effect.

import { motion } from "framer-motion";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { TypingIndicator } from "./TypingIndicator";
import { useReducedMotion } from "../../hooks/useReducedMotion";

function formatTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function MessageBubble({ message, persona, isLastPersonaMessage }) {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={clsx(
        "flex items-start gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Persona avatar */}
      {!isUser && (
        <Avatar
          src={persona?.avatar}
          name={persona?.name}
          gradient={persona?.avatarGradient}
          size="sm"
          animated={isLastPersonaMessage && isStreaming}
          typing={isLastPersonaMessage && isStreaming}
          className="flex-shrink-0"
        />
      )}

      {/* Bubble */}
      <div
        className={clsx(
          "flex flex-col gap-1",
          isUser ? "items-end" : "items-start",
          "max-w-[72%] sm:max-w-[65%]"
        )}
      >
        <div
          className={clsx(
            "text-[15px] leading-relaxed transition-all duration-200",
            isUser
              ? [
                  "glass-md px-4 py-2.5",
                  "bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/15",
                  "text-[var(--color-text-primary)]",
                  "rounded-2xl rounded-br-[var(--radius-sm)] shadow-sm",
                ]
              : [
                  "text-[var(--color-text-primary)]",
                  "py-1.5 px-1",
                ]
          )}
        >
          {isStreaming && !message.content ? (
            <div className="glass rounded-2xl border border-[var(--color-border)] inline-block">
              <TypingIndicator />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Streaming cursor */}
          {isStreaming && message.content && (
            <motion.span
              animate={prefersReduced ? {} : { opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-[var(--color-accent)] ml-0.5 align-middle"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Timestamp — shown on hover */}
        <span className="text-[11px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
