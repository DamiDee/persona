// MessageBubble.jsx — Modern editorial message component with Markdown rendering,
// Modal cold-start telemetry, crisis guardrail badge, and error recovery.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
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
import { resolveApiPersonaId } from "../../data/mockPersonas";

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
 * Renders inline formatting (**bold**, *italic*, `code`) safely as React elements.
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
 * Editorial block renderer for assistant responses (paragraphs, lists, quotes, headings).
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
              className="pl-4 py-1.5 border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 rounded-r-xl italic text-[var(--color-text-secondary)] font-serif text-[17px] leading-relaxed"
            >
              {renderInlineFormatting(quoteText)}
            </blockquote>
          );
        }

        // Unordered list
        if (lines.every((l) => /^[-*•]\s+/.test(l.trim()))) {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-1">
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
                    <span className="text-xs font-mono font-bold text-[var(--color-accent)] mt-1 shrink-0 min-w-[18px]">
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
              className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] pt-1"
            >
              {renderInlineFormatting(headingText)}
            </h4>
          );
        }

        return (
          <p
            key={bIdx}
            className="whitespace-pre-wrap text-[15px] sm:text-[15.5px] leading-[1.76] text-[var(--color-text-primary)]"
          >
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function StreamWaitingStatus({ persona }) {
  const { streamPhase, streamStartedAt } = useChatStore();
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!streamStartedAt) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - streamStartedAt) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [streamStartedAt]);

  const apiSlug = resolveApiPersonaId(persona);
  const isColdStart = streamPhase === "cold_start" || elapsedSec >= 4;

  return (
    <div className="py-2 px-1 space-y-2">
      <div className="flex items-center gap-3">
        <TypingIndicator />
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {isColdStart
            ? `Waking Modal L40S GPU (${apiSlug}) · ${elapsedSec}s elapsed`
            : `Synthesizing response from ${persona?.name || "Persona"}...`}
        </span>
      </div>
      {isColdStart && (
        <div className="p-2.5 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 text-[11px] text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
          <span className="font-bold text-[var(--color-accent)]">
            Modal Cold Start Active:
          </span>{" "}
          The GPU scales to zero when idle. Cold starts take up to 3–4 minutes
          while weights load; once warm, responses stream at ~27 tokens/s (~2s
          latency).
        </div>
      )}
    </div>
  );
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
  const setApiModalOpen = useChatStore((s) => s.setApiModalOpen);
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const prefersReduced = useReducedMotion();

  const isCrisisGuardrail =
    message.finishReason === "guardrail" || message.guardrail === "crisis";
  const apiSlug = message.modelPersona || resolveApiPersonaId(persona);

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
      transition={{ duration: 0.25, ease: "easeOut" }}
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
            ? "items-end max-w-[88%] sm:max-w-[74%] order-first"
            : "items-start min-w-0 flex-1 max-w-[calc(100%-48px)] sm:max-w-[86%]"
        )}
      >
        {/* Persona Author Header */}
        {!isUser && (
          <div className="px-0.5 mb-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {persona?.name || "Persona"}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono text-[10px] font-semibold text-[var(--color-accent)]">
              {apiSlug}
            </span>
            {isCrisisGuardrail ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-500">
                <ShieldAlert size={11} /> Safety Guardrail
              </span>
            ) : message.isDemoResponse ? (
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                Simulated preview
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                {message.usedContext
                  ? "Grounded with RAG context"
                  : "Fine-tuned Persona response"}
              </span>
            )}
          </div>
        )}

        {/* Crisis Guardrail Callout Banner */}
        {!isUser && isCrisisGuardrail && (
          <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-300">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Crisis Guardrail Response:</span> This
              is a fixed support message provided by the safety guardrail
              system, not generative model output.
            </div>
          </div>
        )}

        {/* Error / Auth Required State */}
        {!isUser && message.isError ? (
          <div className="w-full p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] shadow-sm space-y-3">
            <div className="flex items-start gap-2.5">
              {message.isAuthError ? (
                <KeyRound
                  size={17}
                  className="text-[var(--color-accent)] shrink-0 mt-0.5"
                />
              ) : (
                <AlertCircle
                  size={17}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
              )}
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  {message.isAuthError
                    ? "Modal Serving API Authentication Required"
                    : "Unable to Reach Modal Serving Endpoint"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {message.errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => setApiModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-[var(--color-button-text)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <KeyRound size={12} />
                <span>Configure CHAT_API_KEY</span>
              </button>

              {onRegenerate && (
                <>
                  <button
                    type="button"
                    onClick={() => onRegenerate({ forceDemo: false })}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Retry Live API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRegenerate({ forceDemo: true })}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} className="text-[var(--color-accent)]" />
                    <span>Simulate Demo Reply</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Normal Message Content */
          <div
            className={clsx(
              "transition-all duration-200 font-sans",
              isUser
                ? "px-4 py-3 rounded-[22px] rounded-br-md bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] shadow-sm text-[15px] leading-[1.65] font-medium"
                : "w-full text-[var(--color-text-primary)] py-1 px-0.5"
            )}
          >
            {isStreaming && !message.content ? (
              <StreamWaitingStatus persona={persona} />
            ) : isUser ? (
              <p className="whitespace-pre-wrap text-[var(--color-text-primary)]">
                {message.content}
              </p>
            ) : (
              <div className="relative">
                <FormattedMessageContent content={message.content} />
                {isStreaming && message.content && (
                  <motion.span
                    animate={prefersReduced ? {} : { opacity: [1, 0.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 rounded-sm bg-[var(--color-accent)] ml-1 align-middle"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Grounded Source References, Telemetry & Action Toolbar */}
        {!isUser && !isStreaming && message.content && !message.isError && (
          <div className="flex items-center gap-2 px-0.5 pt-1.5 flex-wrap">
            {persona?.sourceMaterial && (
              <button
                type="button"
                onClick={onOpenSources}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
              >
                <BookOpen size={11} className="text-[var(--color-accent)]" />
                <span>
                  {message.usedContext
                    ? "Retrieved Corpus Context"
                    : `Grounded in ${persona.sourceMaterial[0]?.count || 24} ${
                        persona.sourceMaterial[0]?.type || "Sources"
                      }`}
                </span>
              </button>
            )}

            {message.tokensPerSec && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-tertiary)]">
                <Zap size={10} className="text-[var(--color-accent)]" />
                {message.tokensPerSec} tok/s
                {message.ttftMs
                  ? ` · ${(message.ttftMs / 1000).toFixed(1)}s TTFT`
                  : ""}
              </span>
            )}

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy message text"
                title="Copy text"
                className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
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
                  onClick={() => onRegenerate()}
                  aria-label="Regenerate AI response"
                  title="Regenerate response"
                  className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
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
                <Check size={12} className="text-emerald-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
