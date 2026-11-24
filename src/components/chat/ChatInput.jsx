// ChatInput.jsx — Modern composer with Short/Normal/Long length toggle, Stop Generation, Voice input, and 657 Sermons badge

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  BookOpen,
  Cpu,
  Mic,
  Square,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "../ui/Toast";
import { useChatStore } from "../../store/useChatStore";
import { resolveApiPersonaId } from "../../data/mockPersonas";

const MAX_ROWS = 6;
const LINE_HEIGHT = 24;

const LENGTH_OPTIONS = [
  { id: "short", label: "Short" },
  { id: "normal", label: "Normal" },
  { id: "long", label: "Long" },
];

export function ChatInput({
  onSend,
  onStop,
  disabled,
  persona,
  sourceCount = 657,
}) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();
  const {
    apiMode,
    warmupStatus,
    setApiModalOpen,
    responseLength,
    setResponseLength,
  } = useChatStore();

  const apiSlug = resolveApiPersonaId(persona);
  const isSelman = !persona || persona.id === "persona-01" || apiSlug === "ajs";

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = MAX_ROWS * LINE_HEIGHT + 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast({
        title: "Voice Input Unavailable",
        description: "Speech recognition is not supported in this browser.",
        type: "warning",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setValue((current) =>
            current ? `${current} ${transcript}` : transcript
          );
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      addToast({
        title: "Voice Input Error",
        description: "Could not access microphone for voice input.",
        type: "error",
      });
    }
  };

  const isEmpty = !value.trim();

  return (
    <div
      className={clsx(
        "composer-aura rounded-[26px] border bg-[var(--color-bg-elevated)] shadow-[0_14px_44px_-8px_rgba(15,23,42,0.12)] transition-all duration-200",
        isFocused
          ? "border-[var(--color-accent)]"
          : "border-[var(--color-border-strong)] hover:border-[var(--color-border-hover)]"
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={`Ask ${persona?.name || "Joshua Selman"} a question...`}
        rows={1}
        className={clsx(
          "block w-full min-h-[54px] bg-transparent px-5 pt-4 pb-2 text-[15px] sm:text-[15.5px] leading-6 resize-none outline-none font-sans text-[var(--color-text-primary)]",
          "placeholder:text-[var(--color-text-tertiary)] max-h-[168px]"
        )}
        style={{ lineHeight: `${LINE_HEIGHT}px` }}
        aria-label={`Message ${persona?.name || "Joshua Selman"}`}
      />

      <div className="px-3.5 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {/* Short / Normal / Long Length Toggle */}
          <div
            className="inline-flex items-center p-0.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
            role="group"
            aria-label="Reply length"
          >
            {LENGTH_OPTIONS.map((opt) => {
              const active = responseLength === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setResponseLength(opt.id)}
                  className={clsx(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none",
                    active
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                  )}
                  aria-pressed={active}
                  title={`Reply length: ${opt.label}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Grounded in 657 Sermons Badge */}
          <span className="hidden sm:inline-flex min-w-0 items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-secondary)]">
            <BookOpen size={11} className="shrink-0 text-[var(--color-accent)]" />
            <span className="truncate">
              {isSelman
                ? "Grounded in 657 sermons"
                : `Grounded in ${sourceCount} works`}
            </span>
          </span>

          {/* Adapter / Engine Status Pill */}
          <button
            type="button"
            onClick={() => setApiModalOpen(true)}
            title="Configure Modal Serving API & GPU Warmup"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-subtle-hover)] text-[10px] font-bold text-[var(--color-accent)] transition-colors cursor-pointer"
          >
            {apiMode === "live" ? (
              <>
                <Cpu size={11} />
                <span className="font-mono">{apiSlug}</span>
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    warmupStatus === "warm"
                      ? "bg-emerald-500"
                      : warmupStatus === "warming"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-[var(--color-accent)]"
                  )}
                />
              </>
            ) : (
              <>
                <Sparkles size={11} />
                <span>Demo Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleVoiceToggle}
            aria-label="Voice mode input"
            title={isListening ? "Listening..." : "Voice input"}
            className={clsx(
              "w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer",
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            )}
          >
            <Mic size={15} />
          </button>

          {disabled && onStop ? (
            <motion.button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop generating"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-base)] shadow-md transition-all cursor-pointer"
            >
              <Square size={12} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleSend}
              disabled={isEmpty || disabled}
              aria-label="Send message"
              whileHover={isEmpty || disabled ? {} : { scale: 1.04 }}
              whileTap={isEmpty || disabled ? {} : { scale: 0.95 }}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
                isEmpty || disabled
                  ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                  : "bg-gradient-to-br from-[#0891b2] to-[#0e7490] dark:from-[#22d3ee] dark:to-[#0891b2] text-white dark:text-slate-950 shadow-md"
              )}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
