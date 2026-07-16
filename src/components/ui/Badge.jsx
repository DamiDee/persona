// Badge — pill badges for Premium, Free, category labels

import clsx from "clsx";
import { Lock } from "lucide-react";

const variants = {
  premium: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/30",
  free: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
  category: "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer transition-colors duration-150",
  active: "bg-[var(--color-accent)] text-[var(--color-button-text)] border-transparent",
  new: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
};

export function Badge({
  children,
  variant = "free",
  showLock = false,
  className = "",
  onClick,
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5",
        "text-[11px] font-semibold tracking-[0.04em] uppercase",
        "rounded-full border whitespace-nowrap",
        variants[variant],
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {showLock && <Lock size={10} />}
      {children}
    </span>
  );
}

export default Badge;
