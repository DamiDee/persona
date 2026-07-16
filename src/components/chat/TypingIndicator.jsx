// TypingIndicator — three-dot bounce animation while persona responds

import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function TypingIndicator() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex items-center gap-1.5 px-4 py-3" aria-label="Persona is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={prefersReduced ? {} : { y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]"
        />
      ))}
    </div>
  );
}

export default TypingIndicator;
