// useMessageStream — drives the typewriter streaming effect for chat

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Simulates token-by-token streaming of a complete string.
 * Used to re-animate messages when displaying historical content.
 */
export function useTypewriter(text, { speed = 18, enabled = true } = {}) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const indexRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    indexRef.current = 0;

    const tick = () => {
      if (indexRef.current < text.length) {
        // Advance by 1–3 chars per tick for natural variation
        const advance = Math.floor(Math.random() * 2) + 1;
        indexRef.current = Math.min(indexRef.current + advance, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        frameRef.current = setTimeout(tick, speed + Math.random() * 20);
      }
    };

    frameRef.current = setTimeout(tick, speed);
    return () => clearTimeout(frameRef.current);
  }, [text, speed, enabled]);

  return displayed;
}
