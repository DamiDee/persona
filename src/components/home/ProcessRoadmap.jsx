import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function ProcessRoadmap({ milestones = [] }) {
  const [active, setActive] = useState(null);
  const prefersReduced = useReducedMotion();
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-20%" });

  // percentages along the path for each milestone
  const nodePercents = [0.06, 0.28, 0.5, 0.72, 0.94];

  const [positions, setPositions] = useState([]);
  const [dotPos, setDotPos] = useState({ x: -20, y: -20 });
  const animRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();

    // compute node positions
    const pts = nodePercents.map((p) => path.getPointAtLength(length * p));
    setPositions(pts.map((pt) => ({ x: pt.x, y: pt.y })));

    // animate dot along path when in view (respect reduced motion)
    if (!inView || prefersReduced) return;

    let start = null;
    const duration = 1400;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = Math.min(ts - start, duration);
      const t = elapsed / duration;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // simple ease
      const point = path.getPointAtLength(length * eased);
      setDotPos({ x: point.x, y: point.y });
      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animRef.current);
  }, [inView, prefersReduced]);

  const toggle = (idx) => {
    setActive((prev) => (prev === idx ? null : idx));
    const el = containerRef.current?.querySelector(`#milestone-${idx}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  };

  return (
    <section ref={containerRef} id="process" className="relative z-10 py-28 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)] flex items-center justify-center gap-1.5">
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            From source to conversation.
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
            A guided journey showing how ideas flow from source to a live Persona conversation.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Desktop SVG path + progress */}
          <div className="hidden md:block absolute inset-x-0 top-6 pointer-events-none z-0 flex justify-center">
            {/* Wider S-shaped path for a spacious roadmap */}
            <svg viewBox="0 0 1360 260" preserveAspectRatio="xMidYMid meet" className="w-[92%] h-64 overflow-visible">
              <defs>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* dotted base path (soft architectural dotted line) */}
              <path
                d="M40 140 C 280 20, 540 280, 700 140 C 860 20, 1120 280, 1320 140"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="4 10"
                vectorEffect="non-scaling-stroke"
                className="opacity-60"
              />

              {/* animated accent reveal */}
              <motion.path
                ref={pathRef}
                d="M40 140 C 280 20, 540 280, 700 140 C 860 20, 1120 280, 1320 140"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeDasharray="0 1"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="opacity-95"
                filter="url(#softGlow)"
              />

              {/* moving dot */}
              {!prefersReduced && (
                <motion.circle
                  ref={dotRef}
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r={6}
                  fill="var(--color-accent)"
                  className="drop-shadow-lg"
                />
              )}
            </svg>
          </div>

          {/* Desktop nodes placed visually along the path */}
          <div className="hidden md:block relative z-10 w-full" style={{ height: 340 }}>
            {positions.length >= milestones.length && milestones.map((m, i) => {
              const pos = positions[i] || { x: (i + 1) * 200, y: 140 };
              // Use viewBox width 1360 to compute percent
              const leftPercent = (pos.x / 1360) * 100;
              // Alternate nodes slightly above or below the path to avoid overlap
              const verticalOffset = i % 2 === 0 ? -60 : 30;
              const left = `calc(${leftPercent}% )`;
              const top = `${pos.y + verticalOffset}px`;
              const expanded = active === i;
              const Icon = m.icon;

              return (
                <div key={m.step} id={`milestone-${i}`} style={{ position: 'absolute', left, top }} className="transform -translate-x-1/2">
                  <div className="flex items-center flex-col">
                    {/* connector line from node down/up to path */}
                    <div style={{ width: 2, height: Math.abs(verticalOffset) - 8 }} className="bg-[var(--color-border)] rounded-full mb-2" />
                    <button onClick={() => toggle(i)} aria-expanded={expanded} className="group flex flex-col items-center text-left w-64">
                      <div className="w-14 h-14 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-sm group-hover:scale-105 transition-transform">
                        <Icon size={18} />
                      </div>
                      <div className="mt-3 w-full text-center">
                        <div className="flex items-center justify-center gap-3">
                          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{m.title}</h4>
                          <span className="text-xs font-mono text-[var(--color-accent)]">{m.step}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">{m.subtitle}</p>
                      </div>
                      {expanded && (
                        <div className="mt-3 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)]">
                          {m.desc}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile vertical timeline */}
          <div className="md:hidden flex flex-col gap-6 mt-6">
            {milestones.map((m, i) => {
              const expanded = active === i;
              const Icon = m.icon;
              return (
                <div key={m.step} id={`milestone-${i}`} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mt-1" />
                    {i < milestones.length - 1 && <div className="w-px h-full bg-[var(--color-border)] mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
                          <Icon size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{m.title}</h4>
                          <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">{m.subtitle}</div>
                        </div>
                      </div>
                      <button onClick={() => toggle(i)} aria-expanded={expanded} className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1">
                        {expanded ? "Close" : "Explore"} <ChevronRight size={12} />
                      </button>
                    </div>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={expanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.32 }}
                      className="overflow-hidden mt-3"
                    >
                      <p className="text-sm text-[var(--color-text-secondary)]">{m.desc}</p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
