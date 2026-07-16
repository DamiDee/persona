// Input — floating-label input with error state and shake animation

import { useState, forwardRef } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(function Input(
  {
    label,
    type = "text",
    error,
    hint,
    className = "",
    fullWidth = true,
    id,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(rest.value || rest.defaultValue));

  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;
  const isFloated = isFocused || hasValue;

  return (
    <div className={clsx("relative", fullWidth && "w-full", className)}>
      <div
        className={clsx(
          "relative rounded-[var(--radius-md)] border transition-all duration-200",
          "bg-[var(--color-bg-secondary)]",
          error
            ? "border-[var(--color-destructive)]"
            : isFocused
            ? "border-[var(--color-accent)] shadow-[0_0_0_3px_var(--color-accent-subtle)]"
            : "border-[var(--color-border)]",
          error && "animate-[shake_0.4s_ease]"
        )}
      >
        {/* Floating label */}
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              "absolute left-4 pointer-events-none transition-all duration-200 z-10",
              "text-[var(--color-text-tertiary)]",
              isFloated
                ? "top-2 text-[11px] font-medium text-[var(--color-accent)]"
                : "top-1/2 -translate-y-1/2 text-[15px]"
            )}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          className={clsx(
            "w-full bg-transparent text-[var(--color-text-primary)]",
            "text-[15px] outline-none rounded-[var(--radius-md)]",
            "transition-all duration-200",
            label ? "px-4 pt-6 pb-2.5" : "px-4 py-3",
            isPasswordType && "pr-11"
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(Boolean(e.target.value));
          }}
          onChange={(e) => {
            setHasValue(Boolean(e.target.value));
            rest.onChange?.(e);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        />

        {/* Password toggle */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={clsx(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
              "transition-colors duration-150 p-1 rounded"
            )}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Error / Hint text */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[13px] text-[var(--color-destructive)] flex items-center gap-1"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-[13px] text-[var(--color-text-tertiary)]"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

// Password strength meter sub-component
export function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-400",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= strength ? colors[strength] : "bg-[var(--color-bg-tertiary)]"
            )}
          />
        ))}
      </div>
      <p className="text-[12px] text-[var(--color-text-tertiary)]">
        {labels[strength]}
      </p>
    </div>
  );
}

export default Input;
