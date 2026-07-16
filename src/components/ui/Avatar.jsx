// Avatar — circular avatar with optional idle breathing animation and gradient fallback

import { motion } from "framer-motion";
import clsx from "clsx";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const sizes = {
  xs: "w-7 h-7 text-[11px]",
  sm: "w-9 h-9 text-[13px]",
  md: "w-12 h-12 text-[17px]",
  lg: "w-16 h-16 text-[22px]",
  xl: "w-24 h-24 text-[32px]",
  "2xl": "w-32 h-32 text-[44px]",
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  animated = false,
  typing = false,
  gradient = ["#0891b2", "#0e7490"],
  className = "",
  style = {},
  onClick,
}) {
  const prefersReduced = useReducedMotion();

  const breatheAnimation =
    animated && !prefersReduced
      ? {
          scale: [1, 1.018, 1],
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }
      : {};

  const ringClass = typing
    ? "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-base)]"
    : animated
    ? "ring-2 ring-[var(--color-accent)]/40 ring-offset-2 ring-offset-[var(--color-bg-base)]"
    : "";

  return (
    <motion.div
      animate={breatheAnimation}
      className={clsx(
        "relative rounded-full flex-shrink-0",
        typing && !prefersReduced && "animate-[ring-pulse_2s_ease-in-out_infinite]",
        className
      )}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : {}}
      role={onClick ? "button" : undefined}
      aria-label={name ? `${name}'s avatar` : "Avatar"}
    >
      <div
        className={clsx(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold text-white select-none",
          sizes[size],
          ringClass
        )}
        style={{
          background: src
            ? undefined
            : `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          ...style,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{getInitials(name)}</span>
        )}
      </div>
    </motion.div>
  );
}

export default Avatar;
