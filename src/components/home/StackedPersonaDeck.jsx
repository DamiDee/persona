import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Lock, MessageCircle, Sparkles } from "lucide-react";

export default function StackedPersonaDeck({ personas = [], onSelect }) {
  const [index, setIndex] = useState(0);
  const selected = personas[index] || personas[0];

  if (!selected) return null;

  const sourceCount = selected.sourceMaterial?.reduce((total, item) => total + item.count, 0) || 0;

  return (
    <div
      className="relative overflow-hidden rounded-[34px] sm:rounded-[42px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[0_26px_90px_rgba(15,23,42,0.09)]"
      style={{ "--persona-accent": selected.accentColor }}
    >
      <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)] min-h-[560px]">
        {/* Featured mind */}
        <div className="relative min-h-[590px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,color-mix(in_srgb,var(--persona-accent)_22%,transparent),transparent_42%)]" />
          <div className="absolute -right-32 -top-28 w-[480px] h-[480px] rounded-full border border-[var(--color-border)] opacity-60" />
          <div className="absolute -right-16 -top-12 w-[320px] h-[320px] rounded-full border border-[var(--color-border)] opacity-70" />

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 h-full p-6 sm:p-10 lg:p-12 flex flex-col"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-secondary)] shadow-sm">
                    {selected.category}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5 shadow-sm">
                    <BookOpen size={11} style={{ color: selected.accentColor }} />
                    {sourceCount} verified works
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
                  0{index + 1} / 0{personas.length}
                </span>
              </div>

              <div className="relative flex-1 pt-10 sm:pt-14 max-w-[480px] z-20">
                <p className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: selected.accentColor }}>
                  {selected.tagline}
                </p>
                <h3 className="mt-4 text-[42px] sm:text-[58px] lg:text-[64px] leading-[0.94] tracking-[-0.055em] font-extrabold text-[var(--color-text-primary)]">
                  {selected.name.split(" ").map((part, partIndex) => (
                    <span key={part} className="block">
                      {partIndex === selected.name.split(" ").length - 1 ? (
                        <span className="font-serif italic font-normal">{part}</span>
                      ) : (
                        part
                      )}
                    </span>
                  ))}
                </h3>
                <p className="mt-6 max-w-sm text-sm sm:text-[15px] leading-7 text-[var(--color-text-secondary)]">
                  {selected.bio}
                </p>
              </div>

              <div className="relative z-30 mt-8 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSelect?.(selected)}
                  className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-text-primary)] px-5 py-3 text-xs font-bold text-[var(--color-bg-base)] transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {selected.isPremium ? <Lock size={14} /> : <MessageCircle size={14} />}
                  {selected.isPremium ? "Unlock this mind" : "Start a conversation"}
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                {selected.isPremium && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">
                    <Sparkles size={12} /> Premium
                  </span>
                )}
              </div>

              <motion.img
                key={`${selected.id}-portrait`}
                src={selected.avatar}
                alt={`${selected.name} portrait`}
                initial={{ opacity: 0, x: 26, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-[-8%] sm:right-[-2%] lg:right-[-7%] bottom-0 w-[54%] sm:w-[48%] lg:w-[52%] h-[68%] sm:h-[78%] object-cover object-top rounded-tl-[120px] grayscale-[0.08] contrast-[1.02] opacity-30 sm:opacity-95"
              />
              <div className="absolute right-0 bottom-0 w-[56%] h-28 bg-gradient-to-t from-[var(--color-bg-secondary)] to-transparent z-10 pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Catalog rail */}
        <div className="p-4 sm:p-6 lg:p-7 flex flex-col">
          <div className="px-2 pb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--color-text-tertiary)]">
                The collective
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Choose a perspective
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_5px_var(--color-accent-subtle)]" />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {personas.map((persona, personaIndex) => {
              const isActive = personaIndex === index;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setIndex(personaIndex)}
                  className={`group w-full flex items-center gap-3 rounded-[20px] border p-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-[var(--color-text-primary)] border-[var(--color-text-primary)] shadow-lg"
                      : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={persona.avatar}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover object-top"
                    />
                    <span
                      className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full border-[3px] border-[var(--color-bg-elevated)]"
                      style={{ backgroundColor: persona.accentColor }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-bold ${isActive ? "text-[var(--color-bg-base)]" : "text-[var(--color-text-primary)]"}`}>
                        {persona.name}
                      </p>
                      <ArrowUpRight
                        size={14}
                        className={`shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                          isActive ? "text-[var(--color-bg-base)]" : "text-[var(--color-text-tertiary)]"
                        }`}
                      />
                    </div>
                    <p className={`mt-1 truncate text-xs ${isActive ? "text-[var(--color-bg-base)] opacity-60" : "text-[var(--color-text-tertiary)]"}`}>
                      {persona.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 px-2 pt-5 border-t border-[var(--color-border)]">
            <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              Responses are generated from curated source material, with citations available in every conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
