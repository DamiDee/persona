// PersonaAvatarAnimated — large animated avatar for chat page
// Features: breathing scale, cyan ring pulse, typing state waveform

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const waveformBars = [0.4, 0.8, 1, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.7];

export function PersonaAvatarAnimated({
  persona,
  size = "lg", // "md" | "lg" | "xl"
  isTyping = false,
  showName = true,
}) {
  const prefersReduced = useReducedMotion();

  const sizeMap = {
    md: { outer: 64, inner: 56, text: "text-2xl" },
    lg: { outer: 96, inner: 84, text: "text-3xl" },
    xl: { outer: 128, inner: 112, text: "text-4xl" },
  };

  const { outer, inner, text } = sizeMap[size] || sizeMap.lg;

  const gradientColors = persona?.avatarGradient || ["#0891b2", "#0e7490"];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer pulse ring */}
      <div className="relative" style={{ width: outer, height: outer }}>
        {/* Animated ring */}
        {!prefersReduced && (
          <>
            <motion.div
              animate={
                isTyping
                  ? {
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.1, 0.4],
                    }
                  : {
                      scale: [1, 1.06, 1],
                      opacity: [0.25, 0.1, 0.25],
                    }
              }
              transition={{
                duration: isTyping ? 1.2 : 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)]"
            />
            <motion.div
              animate={
                isTyping
                  ? { scale: [1, 1.28, 1], opacity: [0.2, 0, 0.2] }
                  : { scale: [1, 1.1, 1], opacity: [0.1, 0, 0.1] }
              }
              transition={{
                duration: isTyping ? 1.2 : 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="absolute inset-0 rounded-full border border-[var(--color-accent)]"
            />
          </>
        )}

        {/* Avatar circle */}
        <motion.div
          animate={
            prefersReduced
              ? {}
              : { scale: [1, 1.015, 1] }
          }
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
          style={{
            background: persona?.avatar ? undefined : `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
            width: outer,
            height: outer,
            boxShadow: `0 0 30px ${gradientColors[0]}40, 0 4px 20px rgba(0,0,0,0.3)`,
          }}
        >
          {persona?.avatar ? (
            <img
              src={persona.avatar}
              alt={persona.name || "Persona avatar"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className={clsx(text, "select-none")}>
              {persona?.name
                ? persona.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                : "?"}
            </span>
          )}
        </motion.div>

        {/* Online/active dot */}
        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--color-bg-base)]">
          {!prefersReduced && (
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
          )}
        </div>
      </div>

      {/* Waveform / typing indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-end gap-0.5 h-6"
          >
            {waveformBars.map((height, i) => (
              <motion.div
                key={i}
                animate={
                  prefersReduced
                    ? {}
                    : {
                        scaleY: [height, 1, height],
                        opacity: [0.5, 1, 0.5],
                      }
                }
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut",
                }}
                className="w-1 rounded-full bg-[var(--color-accent)]"
                style={{ height: `${Math.round(height * 20)}px` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name */}
      {showName && persona?.name && (
        <div className="text-center">
          <p className="text-[var(--color-text-primary)] font-semibold text-[17px]">
            {persona.name}
          </p>
          <p className="text-[var(--color-text-tertiary)] text-[13px]">
            {isTyping ? "Thinking..." : persona.tagline}
          </p>
        </div>
      )}
    </div>
  );
}

export default PersonaAvatarAnimated;
