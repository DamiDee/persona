// useCursorPosition — throttled cursor tracking for NeuralBackground

import { useState, useEffect, useRef } from "react";

export function useCursorPosition(throttleMs = 16) {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const handleMove = (e) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) return;
      lastUpdateRef.current = now;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? -1000;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? -1000;
      setPosition({ x: clientX, y: clientY });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [throttleMs]);

  return position;
}
