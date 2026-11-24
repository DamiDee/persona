// MessageBubble.jsx — iMessage & ChatGPT inspired conversational bubble component
// Implements Markdown rendering (no raw HTML), collapsible "Sermons drawn on" RAG sources,
// crisis guardrail notice styling (no regenerate), and cold-start waiting indicator.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  KeyRound,
  AlertCircle,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { TypingIndicator } from "./TypingIndicator";
import { useToast } from "../ui/Toast";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useChatStore } from "../../store/useChatStore";

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

/**
 * Renders inline Markdown (**bold**, *italic*, `code`) safely as React elements
 * with raw HTML disabled. Gracefully handles unclosed markers mid-stream.
 */
function renderInlineFormatting(text) {
  if (!text) return null;
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong
          key={idx}
          className="font-bold text-[var(--color-text-primary)]"
        >
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono text-[13px] text-[var(--color-accent)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={idx} className="italic text-[var(--color-text-primary)]/90">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

/**
 * Safe Markdown renderer (raw HTML disabled) for assistant responses.
 */
function FormattedMessageContent({ content }) {
  if (!content) return null;
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-3.5">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split("\n");

        // Blockquote
        if (lines.every((l) => l.trim().startsWith(">"))) {
          const quoteText = lines
            .map((l) => l.trim().replace(/^>\s?/, ""))
            .join("\n");
          return (
            <blockquote
              key={bIdx}
              className="pl-4 py-2 border-l-[3px] border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/50 rounded-r-2xl italic text-[var(--color-text-secondary)] font-serif text-[17px] leading-relaxed"
            >
              {renderInlineFormatting(quoteText)}
            </blockquote>
          );
        }

        // Unordered list
        if (lines.every((l) => /^[-*•]\s+/.test(l.trim()))) {
          return (
            <ul key={bIdx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => (
                <li
                  key={lIdx}
                  className="flex items-start gap-2.5 text-[15px] sm:text-[15.5px] leading-[1.72]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2.5 shrink-0" />
                  <span className="flex-1">
                    {renderInlineFormatting(
                      line.trim().replace(/^[-*•]\s+/, "")
                    )}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
          return (
            <ol key={bIdx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => {
                const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2.5 text-[15px] sm:text-[15.5px] leading-[1.72]"
                  >
                    <span className="text-xs font-mono font-bold text-[var(--color-accent)] mt-1 shrink-0 min-w-[20px]">
                      {match ? `${match[1]}.` : `${lIdx + 1}.`}
                    </span>
                    <span className="flex-1">
                      {renderInlineFormatting(match ? match[2] : line)}
                    </span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Heading
        if (/^#{1,3}\s+/.test(trimmed) && lines.length === 1) {
          const headingText = trimmed.replace(/^#{1,3}\s+/, "");
          return (
            <h4
              key={bIdx}
              className="text-base sm:text-[17px] font-bold tracking-tight text-[var(--color-text-primary)] pt-1"
            >
              {renderInlineFormatting(headingText)}
            </h4>
          );
        }

        return (
          <p
            key={bIdx}
            className="whitespace-pre-wrap text-[15px] sm:text-[15.5px] leading-[1.75] text-[var(--color-text-primary)]"
          >
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Waiting state shown between `start` / `sources` and the first `delta` token.
 */
function StreamWaitingStatus({ persona, sourcesCount = 0 }) {
  const { streamPhase, streamStartedAt, warmupStatus } = useChatStore();
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!streamStartedAt) return;
    const interval = setInterval(() => {
      setElapsedSec(
        Math.max(0, Math.floor((Date.now() - streamStartedAt) / 1000))
      );
    }, 500);
    return () => clearInterval(interval);
  }, [streamStartedAt]);

  const isColdStart =
    streamPhase === "cold_start" ||
    warmupStatus === "warming" ||
    elapsedSec >= 4;

  return (
    <div className="py-1 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <TypingIndicator />
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {isColdStart
            ? `Waking up model, this can take a few minutes (${elapsedSec}s)...`
            : sourcesCount > 0
            ? `Drawing on ${sourcesCount} sermon${
                sourcesCount === 1 ? "" : "s"
              }...`
            : `${persona?.name || "Joshua Selman"} is responding...`}
        </span>
      </div>
      {isColdStart && (
        <div className="p-3 rounded-2xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 text-[11px] text-[var(--color-text-secondary)] max-w-md leading-relaxed">
          <span className="font-bold text-[var(--color-accent)]">
            Waking up model:
          </span>{" "}
          After 5 idle minutes the model sleeps and takes up to about 4 minutes
          to wake. Once warm, replies stream in ~2 seconds.
        </div>
      )}
    </div>
  );
}

/**
 * Collapsible "Sermons drawn on" list under the reply.
 * Displays each source's `title` with its `excerpt` in quotes.
 */
function SermonsDrawnOn({ sources = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!Array.isArray(sources) || sources.length === 0) return null;

  return (
    <div className="w-full mt-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={clsx(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none",
          isOpen
            ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/40 text-[var(--color-accent)]"
            : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        )}
      >
        <BookOpen size={12} className="text-[var(--color-accent)] shrink-0" />
        <span>
          Sermons drawn on ({sources.length})
        </span>
        <ChevronDown
          size={13}
          className={clsx(
            "transition-transform duration-200",
            isOpen ? "rotate-180 text-[var(--color-accent)]" : ""
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3.5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
              <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                Sermons the answer drew on from the corpus (the model may not
                use every one):
              </p>

              <div className="space-y-2.5">
                {sources.map((src, index) => (
                  <div
                    key={src.id || `${src.source}-${src.chunk_index}-${index}`}
                    className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[var(--color-text-primary)] leading-snug">
                        {src.title || src.source || `Sermon #${index + 1}`}
                      </p>
                      {typeof src.similarity === "number" && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-mono text-[10px] font-semibold">
                          {Math.round(src.similarity * 100)}%
                        </span>
                      )}
                    </div>

                    {src.excerpt && (
                      <p className="text-xs italic text-[var(--color-text-secondary)] leading-relaxed">
                        “{src.excerpt.trim()}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MessageBubble({
  message,
  persona,
  isLastPersonaMessage,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const setApiModalOpen = useChatStore((s) => s.setApiModalOpen);
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const prefersReduced = useReducedMotion();

  const isCrisisGuardrail =
    message.finishReason === "guardrail" || message.guardrail === "crisis";
  const sources = Array.isArray(message.sources) ? message.sources : [];

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      addToast({
        title: "Copied to clipboard",
        description: "Message copied.",
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
      initial={{
        opacity: 0,
        y: prefersReduced ? 0 : 10,
        scale: prefersReduced ? 1 : 0.99,
      }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "flex items-end gap-3 sm:gap-3.5 group relative",
        isUser ? "justify-end" : "justify-start items-start"
      )}
    >
      {/* Persona Avatar with active status dot */}
      {!isUser && (
        <div className="relative flex-shrink-0 mt-1">
          <Avatar
            src={persona?.avatar}
            name={persona?.name}
            gradient={persona?.avatarGradient}
            size="sm"
            animated={isLastPersonaMessage && isStreaming}
            typing={isLastPersonaMessage && isStreaming}
            className="shadow-md ring-1 ring-black/5 dark:ring-white/10"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--color-bg-base)]" />
        </div>
      )}

      {/* Message Column */}
      <div
        className={clsx(
          "flex flex-col",
          isUser
            ? "items-end max-w-[84%] sm:max-w-[70%]"
            : "items-start min-w-0 flex-1 max-w-[calc(100%-46px)] sm:max-w-[84%]"
        )}
      >
        {/* Persona Name Header */}
        {!isUser && (
          <div className="px-1 mb-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold tracking-tight text-[var(--color-text-primary)]">
              {persona?.name || "Joshua Selman"}
            </span>
            {isCrisisGuardrail ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-500">
                <ShieldAlert size={11} /> Safety Notice
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[var(--color-text-tertiary)]">
                {persona?.id === "persona-01" || !persona
                  ? "Grounded in 657 sermons"
                  : persona?.tagline}
              </span>
            )}
          </div>
        )}

        {/* Error / Auth Required Recovery Card (half reply never saved) */}
        {!isUser && message.isError ? (
          <div className="w-full p-4 sm:p-5 rounded-[24px] rounded-tl-[6px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] shadow-md space-y-3.5">
            <div className="flex items-start gap-3">
              {message.isAuthError ? (
                <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <KeyRound size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                  {message.isAuthError
                    ? "API Key Required for Live GPU Streaming"
                    : "Unable to Complete Reply"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {message.errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate({ forceDemo: false })}
                  className="px-3.5 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-[var(--color-button-text)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw size={12} />
                  <span>Retry</span>
                </button>
              )}

              {message.isAuthError && (
                <button
                  type="button"
                  onClick={() => setApiModalOpen(true)}
                  className="px-3.5 py-2 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound size={12} />
                  <span>Connect API Key</span>
                </button>
              )}

              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate({ forceDemo: true })}
                  className="px-3.5 py-2 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={12} className="text-[var(--color-accent)]" />
                  <span>Simulate Reply</span>
                </button>
              )}
            </div>
          </div>
        ) : isUser ? (
          /* iMessage-style User Bubble */
          <div
            className={clsx(
              "relative px-4.5 py-3 sm:px-5 sm:py-3.5 rounded-[24px] rounded-br-[6px]",
              "bg-gradient-to-br from-[#0891b2] via-[#0284c7] to-[#0e7490] dark:from-[#06b6d4] dark:via-[#0891b2] dark:to-[#0e7490]",
              "!text-white border border-white/15",
              "shadow-[0_10px_26px_-6px_rgba(8,145,178,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]",
              "text-[15px] sm:text-[15.5px] leading-[1.6] font-medium tracking-[-0.005em] transition-all duration-200"
            )}
          >
            <p className="whitespace-pre-wrap !text-white selection:bg-white/25 selection:text-white">
              {message.content}
            </p>
          </div>
        ) : (
          /* ChatGPT + iMessage Refined Assistant Bubble Card (distinct notice style on crisis replies) */
          <div
            className={clsx(
              "relative w-full px-5 py-4 sm:px-6 sm:py-5 rounded-[24px] rounded-tl-[6px] transition-all duration-200",
              isCrisisGuardrail
                ? "bg-amber-500/[0.08] border-2 border-amber-500/40 text-[var(--color-text-primary)] shadow-sm"
                : [
                    "bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)]/80",
                    "shadow-[0_8px_30px_-8px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "dark:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
                    "text-[var(--color-text-primary)]",
                  ]
            )}
          >
            {isCrisisGuardrail && (
              <div className="mb-3 pb-2.5 border-b border-amber-500/25 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
                <ShieldAlert size={15} className="shrink-0" />
                <span>Support &amp; Helpline Notice</span>
              </div>
            )}

            {isStreaming && !message.content ? (
              <StreamWaitingStatus
                persona={persona}
                sourcesCount={sources.length}
              />
            ) : (
              <div className="relative">
                <FormattedMessageContent content={message.content} />
                {isStreaming && message.content && (
                  <motion.span
                    animate={prefersReduced ? {} : { opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.75, repeat: Infinity }}
                    className="inline-block w-2 h-4 rounded-full bg-[var(--color-accent)] ml-1.5 align-middle"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapsible "Sermons drawn on" list (when sources are returned by RAG) */}
        {!isUser && !message.isError && sources.length > 0 && (
          <SermonsDrawnOn sources={sources} />
        )}

        {/* Assistant Action Bar (Never offer Regenerate on crisis guardrail replies) */}
        {!isUser && !isStreaming && message.content && !message.isError && (
          <div className="flex items-center gap-1.5 px-1.5 pt-1.5">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy message text"
              title="Copy response"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {!isCrisisGuardrail && isLastPersonaMessage && onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate()}
                aria-label="Regenerate response"
                title="Regenerate response"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Regenerate</span>
              </button>
            )}

            {message.tokensPerSec && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-[var(--color-text-tertiary)]">
                <Zap size={10} className="text-[var(--color-accent)]" />
                {message.tokensPerSec} tok/s
              </span>
            )}

            <span className="text-[11px] text-[var(--color-text-tertiary)]/80 ml-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* User Message Subtle Footer */}
        {isUser && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity px-1.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy message text"
              title="Copy message"
              className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check size={11} className="text-emerald-500" />
              ) : (
                <Copy size={11} />
              )}
            </button>
            <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
