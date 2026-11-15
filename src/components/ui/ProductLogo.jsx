import clsx from "clsx";

/**
 * Displays the Persona product wordmark cleanly without clipping.
 */
export function ProductLogo({ className, compact = false }) {
  return (
    <img
      src="/1.png"
      alt="Persona Logo"
      className={clsx(
        "w-auto object-contain shrink-0 select-none rounded-lg",
        compact ? "h-8" : "h-10",
        className
      )}
    />
  );
}

export default ProductLogo;
