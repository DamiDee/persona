// GlassPanel — glassmorphism wrapper with configurable intensity

import clsx from "clsx";

export function GlassPanel({
  children,
  intensity = "md", // "light" | "md" | "strong"
  rounded = "lg",   // "md" | "lg" | "xl" | "full"
  className = "",
  shadow = true,
  ...rest
}) {
  const glassClass = {
    light: "glass",
    md: "glass-md",
    strong: "glass-strong",
  }[intensity] || "glass-md";

  const radiusClass = {
    md: "rounded-[var(--radius-md)]",
    lg: "rounded-[var(--radius-lg)]",
    xl: "rounded-[var(--radius-xl)]",
    full: "rounded-full",
  }[rounded] || "rounded-[var(--radius-lg)]";

  const blurStyle = {
    light: "var(--blur-glass)",
    md: "var(--blur-glass)",
    strong: "var(--blur-glass-strong)",
  }[intensity] || "var(--blur-glass)";

  return (
    <div
      className={clsx(
        glassClass,
        radiusClass,
        shadow && "shadow-[var(--shadow-md)]",
        className
      )}
      style={{
        backdropFilter: blurStyle,
        WebkitBackdropFilter: blurStyle,
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassPanel;
