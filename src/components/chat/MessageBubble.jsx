// MessageBubble.jsx — Editorial reading message component

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Copy, Check, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { TypingIndicator } from "./TypingIndicator";
import { useToast } from "../ui/Toast";
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

export function MessageBubble({
  message,
  persona,
  isLastPersonaMessage,
  onOpenSources,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const prefersReduced = useReducedMotion();

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      addToast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({
        title: "Failed to copy",
        description: "Could not access clipboard.",
        type: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={clsx(
        "flex items-start gap-3 sm:gap-4 group relative",
        isUser ? "justify-end" : "justify-start"
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
          className="flex-shrink-0 mt-0.5 shadow-sm"
        />
      )}

      {/* Bubble Container */}
      <div
        className={clsx(
          "flex flex-col gap-1.5",
          isUser
            ? "items-end max-w-[88%] sm:max-w-[72%] order-first"
            : "items-start min-w-0 max-w-[calc(100%-48px)] sm:max-w-[82%]"
        )}
      >
        {!isUser && (
          <div className="px-1 mb-0.5 flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {persona?.name || "Persona"}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
              Grounded response
            </span>
          </div>
        )}
        <div
          className={clsx(
            "text-[15px] sm:text-[16px] leading-[1.75] transition-all duration-200 font-sans",
            isUser
              ? [
                  "px-4 py-3 rounded-[20px] rounded-br-md bg-[#f4f4f5] !text-[#111318] border border-black/[0.06] font-medium shadow-sm",
                ]
              : ["text-[var(--color-text-primary)] py-1 px-1"]
          )}
        >
          {isStreaming && !message.content ? (
            <div className="py-1">
              <TypingIndicator />
            </div>
          ) : (
            <p
              className={clsx(
                "whitespace-pre-wrap",
                isUser ? "!text-[#111318]" : "!text-[var(--color-text-primary)]"
              )}
            >
              {message.content}
            </p>
          )}

          {/* Streaming cursor */}
          {isStreaming && message.content && (
            <motion.span
              animate={prefersReduced ? {} : { opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-4 bg-[var(--color-accent)] ml-1 align-middle"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Grounded Source References & Action Toolbar */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-2.5 px-1 pt-2 flex-wrap">
            {persona?.sourceMaterial && (
              <button
                type="button"
                onClick={onOpenSources}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
              >
                <BookOpen size={11} className="text-[var(--color-accent)]" />
                <span>
                  Grounded in {persona.sourceMaterial[0]?.count || 24}{" "}
                  {persona.sourceMaterial[0]?.type || "Sources"}
                </span>
              </button>
            )}

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy message text"
                title="Copy text"
                className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
              </button>

              {isLastPersonaMessage && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  aria-label="Regenerate AI response"
                  title="Regenerate response"
                  className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
              )}

              <span className="text-[11px] text-[var(--color-text-tertiary)] ml-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        )}

        {/* User Message Action Toolbar & Timestamp */}
        {isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity px-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy message text"
              title="Copy text"
              className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
