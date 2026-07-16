// Toggle — theme switch with sun/moon icon and animated pill

import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";

// Simple on/off toggle
export function Toggle({ checked, onChange, label, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none"
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={clsx(
            "w-11 h-6 rounded-full transition-colors duration-250",
            checked
              ? "bg-[var(--color-accent)]"
              : "bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
          )}
        >
          <motion.div
            animate={{ x: checked ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          />
        </div>
      </div>
      {label && (
        <span className="text-[15px] text-[var(--color-text-primary)]">
          {label}
        </span>
      )}
    </label>
  );
}

// Segmented theme control: light / dark / system
export function ThemeSegment({ value, onChange }) {
  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className={clsx(
        "relative flex gap-0 p-1 rounded-[var(--radius-md)]",
        "bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
      )}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-[calc(var(--radius-md)-4px)] bg-[var(--color-bg-base)] shadow-[var(--shadow-sm)]"
        animate={{ left: `calc(${activeIndex * 33.33}% + 4px)` }}
        style={{ width: "calc(33.33% - 4px)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "relative z-10 flex items-center justify-center gap-1.5 flex-1",
              "px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-[13px] font-medium",
              "transition-colors duration-200",
              isActive
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <Icon size={13} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Toggle;
