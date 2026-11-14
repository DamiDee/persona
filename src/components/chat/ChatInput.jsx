// ChatInput.jsx — Modern composer with Stop Generation, Voice input, Adapter pill, and Source attachment

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  BookOpen,
  Cpu,
  Mic,
  Paperclip,
  Square,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "../ui/Toast";
import { useChatStore } from "../../store/useChatStore";
import { resolveApiPersonaId } from "../../data/mockPersonas";

const MAX_ROWS = 6;
const LINE_HEIGHT = 24;

export function ChatInput({
  onSend,
  onStop,
  onOpenSources,
  disabled,
  persona,
  sourceCount = 0,
}) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();
  const { apiMode, warmupStatus, setApiModalOpen } = useChatStore();

  const apiSlug = resolveApiPersonaId(persona);

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
        "composer-aura rounded-[24px] border bg-[var(--color-bg-elevated)] shadow-[0_12px_40px_rgba(15,23,42,0.10)] transition-all duration-200",
        isFocused
          ? "border-[var(--color-accent)] ring-4 ring-[var(--color-accent-subtle)]"
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
        placeholder={`Ask ${persona?.name || "Persona"} anything...`}
        rows={1}
        className={clsx(
          "block w-full min-h-[56px] bg-transparent px-4 sm:px-5 pt-3.5 pb-2 text-[15px] leading-6 resize-none outline-none font-sans text-[var(--color-text-primary)]",
          "placeholder:text-[var(--color-text-tertiary)] max-h-[168px]"
        )}
        style={{ lineHeight: `${LINE_HEIGHT}px` }}
        aria-label={`Message ${persona?.name || "Persona"}`}
      />

      <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <button
            type="button"
            onClick={onOpenSources}
            aria-label="Attach a source"
            title="Attach or inspect sources"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
          >
            <Paperclip size={15} />
          </button>

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

          <button
            type="button"
            onClick={onOpenSources}
            className="hidden sm:inline-flex min-w-0 items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <BookOpen size={11} className="shrink-0 text-[var(--color-accent)]" />
            <span className="truncate">{sourceCount} sources</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden md:inline text-[10px] font-mono text-[var(--color-text-tertiary)] mr-1 select-none">
            {disabled ? "Streaming..." : "Enter ↵"}
          </span>

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
                  : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-[var(--color-button-text)] shadow-md"
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
