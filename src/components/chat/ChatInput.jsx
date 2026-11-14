import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, BookOpen, Mic, Paperclip, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useToast } from "../ui/Toast";

const MAX_ROWS = 6;
const LINE_HEIGHT = 24;

export function ChatInput({ onSend, onOpenSources, disabled, persona, sourceCount = 0 }) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
        if (transcript) setValue((current) => (current ? `${current} ${transcript}` : transcript));
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
        "composer-aura rounded-[26px] border bg-[var(--color-bg-elevated)] shadow-[0_14px_50px_rgba(15,23,42,0.12)] transition-all duration-200",
        isFocused
          ? "border-[var(--color-accent)] ring-4 ring-[var(--color-accent-subtle)]"
          : "border-[var(--color-border-strong)]"
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={`Message ${persona?.name || "Persona"}`}
        disabled={disabled}
        rows={1}
        className={clsx(
          "block w-full min-h-[60px] bg-transparent px-5 pt-4 pb-2 text-[15px] sm:text-base leading-6 resize-none outline-none font-sans text-[var(--color-text-primary)]",
          "placeholder:text-[var(--color-text-tertiary)] max-h-[168px] disabled:opacity-50"
        )}
        style={{ lineHeight: `${LINE_HEIGHT}px` }}
        aria-label={`Message ${persona?.name || "Persona"}`}
      />

      <div className="px-3 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onOpenSources}
            aria-label="Attach a source"
            title="Attach a source"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
          >
            <Paperclip size={16} />
          </button>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-subtle)] text-[10px] font-bold text-[var(--color-accent)]">
            <Sparkles size={11} /> Insight mode
          </span>
          <button
            type="button"
            onClick={onOpenSources}
            className="hidden sm:inline-flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <BookOpen size={11} className="shrink-0 text-[var(--color-accent)]" />
            <span className="truncate">Grounded in {sourceCount} sources</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleVoiceToggle}
            aria-label="Voice mode input"
            title={isListening ? "Listening..." : "Voice input"}
            className={clsx(
              "w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer",
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            )}
          >
            <Mic size={16} />
          </button>

          <motion.button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || disabled}
            aria-label="Send message"
            whileHover={isEmpty || disabled ? {} : { scale: 1.04 }}
            whileTap={isEmpty || disabled ? {} : { scale: 0.95 }}
            className={clsx(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
              isEmpty || disabled
                ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                : "bg-[var(--color-text-primary)] text-[var(--color-bg-base)] shadow-md"
            )}
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
