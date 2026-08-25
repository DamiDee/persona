// ThemeToggle.jsx — Global theme switcher (Light / Dark / System)
// Uses Lucide icons (Sun, Moon, Monitor) without emojis.

import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useThemeStore } from "../../store/useThemeStore";

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useThemeStore();

  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div
      className={clsx(
        "inline-flex items-center p-1 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] shadow-inner",
        className
      )}
      role="group"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={clsx(
              "relative px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none",
              isActive
                ? "text-[var(--color-text-primary)] shadow-sm font-bold"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
            title={`Switch to ${opt.label} mode`}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-pill"
                className="absolute inset-0 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={14} className={clsx("relative z-10", isActive ? "text-[var(--color-accent)]" : "")} />
            <span className="relative z-10 hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
