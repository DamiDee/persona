import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import PersonaCard from "../ui/PersonaCard";

export default function StackedPersonaDeck({ personas = [], onSelect }) {
  const [index, setIndex] = useState(0);
  const total = personas.length;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  return (
    <div className="w-full relative flex items-center justify-center">
      {/* Left control */}
      <button
        onClick={prev}
        aria-label="Previous persona"
        className="absolute left-2 md:left-8 z-30 w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="relative w-full max-w-5xl h-[420px] flex items-center justify-center">
        {personas.map((p, i) => {
          // stacking: top card is at current index, previous cards behind with offsets
          const offset = i - index;
          const abs = Math.abs(offset);
          const visible = Math.abs(offset) <= 4; // render nearby cards
          const z = 100 - abs;
          const translateY = offset * 18;
          const scale = offset === 0 ? 1 : Math.max(0.86, 1 - abs * 0.04);
          const opacity = offset === 0 ? 1 : Math.max(0.35, 1 - abs * 0.22);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: visible ? opacity : 0, y: translateY, scale }}
              transition={{ duration: 0.36 }}
              style={{ zIndex: z }}
              className={clsx(
                "absolute cursor-pointer",
                visible ? "pointer-events-auto" : "pointer-events-none"
              )}
              onClick={() => (i === index ? onSelect?.(p) : setIndex(i))}
            >
              <div style={{ width: 320 }}>
                <PersonaCard persona={p} onSelect={onSelect} className="w-full" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right control */}
      <button
        onClick={next}
        aria-label="Next persona"
        className="absolute right-2 md:right-8 z-30 w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
