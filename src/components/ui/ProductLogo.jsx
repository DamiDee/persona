import clsx from "clsx";

/**
 * Displays the supplied product wordmark while cropping its large transparent canvas.
 * The white plate keeps the original dark lettering legible in both themes.
 */
export function ProductLogo({ className, compact = false }) {
  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden bg-white",
        compact
          ? "w-[118px] h-9 rounded-xl"
          : "w-[154px] h-[48px] rounded-2xl",
        className
      )}
    >
      <img
        src="/1.png"
        alt="Persona"
        className={clsx(
          "absolute max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain",
          compact ? "w-[292px]" : "w-[370px]"
        )}
      />
    </div>
  );
}

export default ProductLogo;
