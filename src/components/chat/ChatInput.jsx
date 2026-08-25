// ChatInput.jsx — Floating chat composer with auto-expanding textarea & persona context indicator

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Mic } from "lucide-react";
import clsx from "clsx";
import { useToast } from "../ui/Toast";

const MAX_ROWS = 6;
const LINE_HEIGHT = 24;

export function ChatInput({ onSend, disabled, persona }) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  const resize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = MAX_ROWS * LINE_HEIGHT + 24;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
          setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
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
    <div className="px-2 pb-2">
      {/* Floating Composer Container */}
      <div
        className={clsx(
          "rounded-3xl border transition-all duration-300",
          "flex items-end gap-3 px-4 py-2",
          "bg-[var(--color-bg-elevated)] backdrop-blur-2xl border-[var(--color-border)] shadow-xl"
        )}
      >
        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${persona?.name || "Persona"} anything...`}
          disabled={disabled}
          rows={1}
          className={clsx(
            "flex-1 bg-transparent text-[var(--color-text-primary)] py-2.5",
            "text-sm sm:text-base leading-6 resize-none outline-none font-sans",
            "placeholder:text-[var(--color-text-tertiary)]",
            "max-h-[144px] transition-all duration-100",
            "disabled:opacity-50"
          )}
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
          aria-label={`Message ${persona?.name || "Persona"}`}
        />

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
          {/* Voice Mode Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            aria-label="Voice mode input"
            title={isListening ? "Listening..." : "Voice input"}
            className={clsx(
              "w-11 h-11 flex items-center justify-center rounded-full transition-all cursor-pointer",
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
            )}
          >
            <Mic size={16} />
          </button>

          {/* Send Button */}
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || disabled}
            aria-label="Send message"
            whileHover={isEmpty || disabled ? {} : { scale: 1.05 }}
            whileTap={isEmpty || disabled ? {} : { scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shadow-md",
              isEmpty || disabled
                ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] opacity-50 cursor-not-allowed"
                : "bg-[var(--color-accent)] text-[var(--color-button-text)] hover:bg-[var(--color-accent-glow)]"
            )}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
