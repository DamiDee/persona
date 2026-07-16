// Button — primary, secondary, ghost, icon variants
// Framer Motion scale on tap; cyan glow on hover for primary.

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-button-text)] hover:bg-[var(--color-accent-glow)] shadow-[var(--shadow-accent)] hover:shadow-[var(--shadow-accent-lg)]",
  secondary:
    "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-text-primary)]",
  destructive:
    "bg-[var(--color-destructive)] text-white hover:opacity-90",
  icon:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-md)] min-h-[32px]",
  md: "px-5 py-2.5 text-[15px] rounded-[var(--radius-md)] min-h-[44px]",
  lg: "px-8 py-3.5 text-[17px] rounded-[var(--radius-md)] min-h-[52px]",
  icon: "w-10 h-10 rounded-[var(--radius-md)] p-0",
  "icon-sm": "w-8 h-8 rounded-[var(--radius-sm)] p-0",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={fullWidth ? "w-full" : ""}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition-all duration-200 cursor-pointer select-none",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    </motion.div>
  );
}

export default Button;
