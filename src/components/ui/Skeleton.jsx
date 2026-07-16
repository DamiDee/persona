// Skeleton — shimmer loading placeholder

import clsx from "clsx";

export function Skeleton({
  width,
  height = 16,
  className = "",
  rounded = "md",
  count = 1,
}) {
  const radiusClass = {
    sm: "rounded-[var(--radius-sm)]",
    md: "rounded-[var(--radius-md)]",
    lg: "rounded-[var(--radius-lg)]",
    full: "rounded-full",
  }[rounded] || "rounded-[var(--radius-md)]";

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={clsx("skeleton", radiusClass, className)}
            style={{
              width: i === count - 1 && count > 1 ? "60%" : width || "100%",
              height,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx("skeleton", radiusClass, className)}
      style={{ width: width || "100%", height }}
      aria-hidden="true"
    />
  );
}

// Persona card skeleton
export function PersonaCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-lg)] p-5 space-y-4">
      <Skeleton width={64} height={64} rounded="full" className="mx-auto" />
      <div className="space-y-2">
        <Skeleton height={18} width="60%" className="mx-auto" />
        <Skeleton height={14} width="80%" className="mx-auto" />
      </div>
      <Skeleton height={36} rounded="md" />
    </div>
  );
}

// Chat message skeleton
export function MessageSkeleton({ align = "left" }) {
  return (
    <div
      className={clsx(
        "flex items-end gap-3",
        align === "right" && "flex-row-reverse"
      )}
    >
      {align === "left" && (
        <Skeleton width={32} height={32} rounded="full" className="flex-shrink-0" />
      )}
      <div
        className={clsx(
          "space-y-1.5",
          align === "right" ? "items-end" : "items-start",
          "flex flex-col max-w-[60%]"
        )}
      >
        <Skeleton height={16} width={Math.random() * 100 + 120} />
        <Skeleton height={16} width={Math.random() * 80 + 80} />
      </div>
    </div>
  );
}

export default Skeleton;
