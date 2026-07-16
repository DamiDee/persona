// ChatInput — auto-expanding textarea, send button, model chip

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Mic } from "lucide-react";
import clsx from "clsx";

const MAX_ROWS = 6;
const LINE_HEIGHT = 24;

export function ChatInput({ onSend, disabled, persona }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = MAX_ROWS * LINE_HEIGHT + 24; // +24 for padding
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

  const isEmpty = !value.trim();

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Persona chip */}
      {persona && (
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-[var(--color-border)] text-[12px] text-[var(--color-text-tertiary)]">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${persona.avatarGradient?.[0]}, ${persona.avatarGradient?.[1]})`,
              }}
            />
            <span>Chatting with {persona.name}</span>
            <span className="opacity-40">·</span>
            <span className="text-[var(--color-accent)]">Demo mode</span>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div
        className={clsx(
          "glass-md rounded-[var(--radius-xl)] border transition-all duration-200",
          "flex items-end gap-3 px-4 py-2.5",
          "border-[var(--color-border)]",
          "focus-within:border-[var(--color-border-strong)] focus-within:shadow-[var(--shadow-md)]"
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${persona?.name || "Persona"}...`}
          disabled={disabled}
          rows={1}
          className={clsx(
            "flex-1 bg-transparent text-[var(--color-text-primary)]",
            "text-[15px] leading-6 resize-none outline-none",
            "placeholder:text-[var(--color-text-tertiary)]",
            "max-h-[144px] transition-all duration-100",
            "disabled:opacity-50"
          )}
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
          aria-label={`Message ${persona?.name || "Persona"}`}
          aria-multiline="true"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
          {/* Voice (locked/demo) */}
          <button
            type="button"
            aria-label="Voice mode (Premium feature)"
            title="Voice mode — Premium"
            disabled
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-tertiary)] opacity-40 cursor-not-allowed"
          >
            <Mic size={16} />
          </button>

          {/* Send */}
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || disabled}
            aria-label="Send message"
            whileHover={isEmpty || disabled ? {} : { scale: 1.06 }}
            whileTap={isEmpty || disabled ? {} : { scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "w-9 h-9 flex items-center justify-center rounded-full",
              "transition-all duration-200",
              isEmpty || disabled
                ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                : "bg-[var(--color-accent)] text-[var(--color-button-text)] shadow-[var(--shadow-accent)] hover:shadow-[var(--shadow-accent-lg)]"
            )}
          >
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-2 opacity-70">
        Persona may produce inaccurate information. This is a demo experience.
      </p>
    </div>
  );
}

export default ChatInput;
