import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function PersonaCoverflow({ personas = [], onSelect }) {
  const [active, setActive] = useState(Math.floor(personas.length / 2));
  const containerRef = useRef(null);

  const prev = () => setActive((a) => Math.max(0, a - 1));
  const next = () => setActive((a) => Math.min(personas.length - 1, a + 1));

  const handleClick = (idx) => {
    if (idx === active) {
      onSelect?.(personas[idx]);
    } else {
      setActive(idx);
    }
  };

  const onDragEnd = (event, info) => {
    const dx = info.offset.x;
    if (dx < -40) next();
    else if (dx > 40) prev();
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={containerRef}
          style={{ perspective: 1200 }}
          className="w-full overflow-visible py-8 select-none"
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            className="relative flex items-center justify-center gap-6 will-change-transform"
          >
            {personas.map((p, i) => {
              const offset = i - active;
              const abs = Math.abs(offset);
              const scale = offset === 0 ? 1.2 : Math.max(0.8, 1 - abs * 0.06);
              const rotateY = offset * -18;
              const translateX = offset * 140;
              const zIndex = 100 - abs;
              const opacity = offset === 0 ? 1 : Math.max(0.35, 1 - abs * 0.25);

              return (
                <motion.button
                  key={p.id}
                  onClick={() => handleClick(i)}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "relative bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-lg cursor-pointer focus:outline-none",
                    "flex-shrink-0"
                  )}
                  style={{
                    width: 260,
                    height: 360,
                    transform: `translateX(${translateX}px) translateZ(0px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                    transition: "transform 400ms cubic-bezier(.16,1,.3,1), opacity 300ms",
                  }}
                >
                  {/* Ambient glow */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      boxShadow:
                        offset === 0
                          ? "0 30px 60px rgba(8,145,178,0.14), 0 6px 18px rgba(8,145,178,0.08)"
                          : "0 12px 34px rgba(15,17,21,0.06)",
                      background: offset === 0 ? "radial-gradient(ellipse at center, rgba(8,145,178,0.06), transparent 40%)" : "transparent",
                    }}
                  />

                  {/* Card content */}
                  <div className="relative z-10 flex flex-col h-full overflow-hidden rounded-2xl">
                    <div className="flex-1 bg-gradient-to-b from-[var(--color-bg-elevated)] to-[var(--color-bg-secondary)] p-4 rounded-t-2xl flex items-end">
                      <img src={p.avatar} alt={p.name} className="w-full h-56 object-cover rounded-lg shadow-inner" />
                    </div>
                    <div className="p-4 bg-[var(--color-bg-elevated)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--color-text-primary)]">{p.name}</div>
                          <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{p.field}</div>
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">{p.sourceCount} sources</div>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-3 line-clamp-3">{p.blurb}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Controls (glass overlay) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[72%] flex items-center justify-between p-3 bg-[var(--color-glass-medium)] rounded-full border border-[var(--color-border)] shadow-sm">
            <button onClick={prev} aria-label="Previous" className="px-3 py-2 rounded-full bg-transparent hover:bg-[var(--color-bg-tertiary)] transition">
              ‹
            </button>
            <div className="text-xs text-[var(--color-text-tertiary)]">Drag or click a card to select</div>
            <button onClick={next} aria-label="Next" className="px-3 py-2 rounded-full bg-transparent hover:bg-[var(--color-bg-tertiary)] transition">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
