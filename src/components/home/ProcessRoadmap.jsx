import { useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const DESKTOP_LAYOUT = [
  { x: 70, y: 216, labelTop: 52, align: "left" },
  { x: 326, y: 106, labelTop: 154, align: "center" },
  { x: 568, y: 228, labelTop: 274, align: "center" },
  { x: 824, y: 116, labelTop: 166, align: "center" },
  { x: 1130, y: 208, labelTop: 48, align: "right" },
];

export default function ProcessRoadmap({ milestones = [] }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-15%" });
  const prefersReducedMotion = useReducedMotion();
  const selected = useMemo(() => milestones[active] || milestones[0], [active, milestones]);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative z-10 py-20 sm:py-28 bg-[var(--color-bg-base)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] sm:rounded-[44px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[0_30px_100px_rgba(15,23,42,0.07)]">
          <div className="px-6 pt-10 sm:px-12 sm:pt-14 lg:px-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--color-accent)]">
                <span className="h-px w-8 bg-[var(--color-accent)]" />
                How Persona works
              </div>
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-[-0.05em] leading-[0.98] text-[var(--color-text-primary)]">
                Source to insight,
                <span className="font-serif italic font-normal"> step by step.</span>
              </h2>
            </div>

            <div className="lg:max-w-sm lg:text-right">
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Every response passes through a transparent knowledge path designed to keep the original ideas intact.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_5px_var(--color-accent-subtle)]" />
                Grounded by design
              </div>
            </div>
          </div>

          {/* Desktop process canvas, inspired by the supplied editorial process reference. */}
          <div className="hidden lg:block relative mx-10 xl:mx-14 mt-4 h-[455px]">
            <svg
              viewBox="0 0 1200 340"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-6 w-full h-[340px] overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="processLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.45" />
                  <stop offset="45%" stopColor="var(--color-accent)" />
                  <stop offset="100%" stopColor="var(--color-accent-glow)" />
                </linearGradient>
                <filter id="processShadow" x="-20%" y="-40%" width="140%" height="180%">
                  <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#0891b2" floodOpacity="0.14" />
                </filter>
              </defs>

              <path
                d="M70 216 C170 216 196 106 326 106 C452 106 452 228 568 228 C686 228 704 116 824 116 C950 116 982 208 1130 208"
                fill="none"
                stroke="var(--color-border-strong)"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.25"
              />
              <motion.path
                d="M70 216 C170 216 196 106 326 106 C452 106 452 228 568 228 C686 228 704 116 824 116 C950 116 982 208 1130 208"
                fill="none"
                stroke="url(#processLine)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
                animate={{ pathLength: inView ? 1 : 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                filter="url(#processShadow)"
              />
            </svg>

            {milestones.map((milestone, index) => {
              const item = DESKTOP_LAYOUT[index] || DESKTOP_LAYOUT[DESKTOP_LAYOUT.length - 1];
              const Icon = milestone.icon;
              const isActive = index === active;

              return (
                <div key={milestone.step}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    aria-label={`View step ${milestone.step}: ${milestone.title}`}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${(item.x / 1200) * 100}%`, top: `${item.y + 24}px` }}
                  >
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                      transition={{ delay: 0.18 + index * 0.12, duration: 0.4 }}
                      className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-[19px] border bg-[var(--color-bg-elevated)] shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition-all duration-300 ${
                        isActive
                          ? "border-[var(--color-accent)] text-[var(--color-accent)] -translate-y-1"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]"
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                      <span
                        className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-[3px] border-[var(--color-bg-elevated)] transition-colors ${
                          isActive ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]"
                        }`}
                      />
                    </motion.span>
                  </button>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.45 }}
                    className={`absolute w-[210px] ${
                      item.align === "left"
                        ? "text-left"
                        : item.align === "right"
                          ? "text-right -translate-x-full"
                          : "text-center -translate-x-1/2"
                    }`}
                    style={{ left: `${(item.x / 1200) * 100}%`, top: `${item.labelTop}px` }}
                  >
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[76px] font-extrabold tracking-[-0.08em] leading-none text-[var(--color-text-primary)] opacity-[0.035] select-none">
                      {milestone.step}
                    </span>
                    <p className="relative text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--color-accent)]">
                      Step {milestone.step}
                    </p>
                    <h3 className="relative mt-1.5 text-lg font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                      {milestone.title.charAt(0) + milestone.title.slice(1).toLowerCase()}
                    </h3>
                    <p className="relative mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {milestone.subtitle}
                    </p>
                  </motion.div>
                </div>
              );
            })}

            {selected && (
              <motion.div
                key={selected.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[520px] px-5 py-3 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-sm flex items-center gap-4"
              >
                <span className="shrink-0 text-[10px] font-bold tracking-[0.15em] text-[var(--color-accent)]">
                  {selected.step} / 05
                </span>
                <span className="h-6 w-px bg-[var(--color-border)]" />
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {selected.desc}
                </p>
              </motion.div>
            )}
          </div>

          {/* Mobile process: the same story becomes a spacious vertical sequence. */}
          <div className="lg:hidden px-5 sm:px-8 pt-10 pb-8">
            <div className="relative">
              <div className="absolute left-[25px] top-8 bottom-8 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)] to-transparent opacity-50" />
              <div className="space-y-4">
                {milestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  return (
                    <motion.article
                      key={milestone.step}
                      initial={{ opacity: 0, x: -12 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                      transition={{ delay: index * 0.08, duration: 0.35 }}
                      className="relative grid grid-cols-[52px_1fr] gap-4 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-sm"
                    >
                      <div className="relative z-10 w-[52px] h-[52px] rounded-2xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center">
                        <Icon size={19} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--color-accent)]">
                            Step {milestone.step}
                          </span>
                          <ArrowDownRight size={14} className="text-[var(--color-text-tertiary)]" />
                        </div>
                        <h3 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
                          {milestone.title.charAt(0) + milestone.title.slice(1).toLowerCase()}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {milestone.desc}
                        </p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
