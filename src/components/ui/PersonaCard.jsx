// PersonaCard.jsx — Premium character selection card for Persona
// Supports Light & Dark themes, category environment lighting, artwork hover scale, zero emojis.

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Lock, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "./Avatar";

const CATEGORY_COLORS = {
  faith: {
    border: "group-hover:border-cyan-500/40",
    glow: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    badgeBg: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/30",
    accentText: "text-[var(--color-accent)]",
    shadow: "group-hover:shadow-[0_12px_40px_rgba(8,145,178,0.12)]",
  },
  leadership: {
    border: "group-hover:border-amber-500/40",
    glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
    accentText: "text-amber-600 dark:text-amber-400",
    shadow: "group-hover:shadow-[0_12px_40px_rgba(217,119,6,0.12)]",
  },
  literature: {
    border: "group-hover:border-rose-500/40",
    glow: "bg-rose-500/10 group-hover:bg-rose-500/20",
    badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
    accentText: "text-rose-600 dark:text-rose-400",
    shadow: "group-hover:shadow-[0_12px_40px_rgba(225,29,72,0.12)]",
  },
  culture: {
    border: "group-hover:border-purple-500/40",
    glow: "bg-purple-500/10 group-hover:bg-purple-500/20",
    badgeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
    accentText: "text-purple-600 dark:text-purple-400",
    shadow: "group-hover:shadow-[0_12px_40px_rgba(124,58,237,0.12)]",
  },
};

export function PersonaCard({ persona, onClick, onSelect, className }) {
  const categoryTheme = CATEGORY_COLORS[persona.category] || CATEGORY_COLORS.faith;

  const handleClick = () => {
    if (onSelect) {
      onSelect(persona);
    } else if (onClick) {
      onClick(persona);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, cubicBezier: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      className={clsx(
        "group relative rounded-[20px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-5 cursor-pointer",
        "flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-sm",
        categoryTheme.border,
        categoryTheme.shadow,
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Select ${persona.name}`}
      aria-describedby={`persona-desc-${persona.id}`}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Category Ambient Glow */}
      <div
        className={clsx(
          "absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-all duration-500",
          categoryTheme.glow
        )}
      />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span
            className={clsx(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border",
              categoryTheme.badgeBg
            )}
          >
            {persona.category}
          </span>
          {persona.isPremium ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> PRO
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Free
            </span>
          )}
        </div>

        {/* Persona Artwork */}
        <div className="relative flex justify-center mb-4">
          <div
            className={clsx(
              "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
              categoryTheme.glow
            )}
          />
          <Avatar
            src={persona.avatar}
            name={persona.name}
            gradient={persona.avatarGradient}
            size="lg"
            animated
            className="group-hover:scale-105 transition-transform duration-400 ease-out z-10 shadow-lg"
          />
        </div>

        {/* Name & Tagline */}
        <div className="text-center space-y-1 relative z-10">
          <h3 className="text-[var(--color-text-primary)] font-bold text-xl sm:text-2xl tracking-tight leading-tight transition-colors">
            {persona.name}
          </h3>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed line-clamp-2">
            {persona.tagline}
          </p>
        </div>

        {/* Source Metrics */}
        {persona.sourceMaterial && persona.sourceMaterial.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-[12px] text-[var(--color-text-tertiary)] relative z-10">
            {persona.sourceMaterial.slice(0, 2).map((src, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                <BookOpen size={11} className={categoryTheme.accentText} />
                <span className="font-medium">{src.count} {src.type}</span>
              </span>
            ))}
          </div>
        )}

        {/* Accessible description for screen readers */}
        <p id={`persona-desc-${persona.id}`} className="sr-only">
          {persona.name}. {persona.tagline}. {persona.sourceMaterial ? persona.sourceMaterial.map(s => `${s.count} ${s.type}`).join(', ') : ''}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between relative z-10">
        <span className="text-sm font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
          {persona.isPremium ? "Explore Mind" : "Start Conversation"}
        </span>
        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1", persona.isPremium ? "bg-[var(--color-bg-tertiary)] text-amber-500" : "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-button-text)]") } aria-hidden>
          {persona.isPremium ? <Lock size={14} /> : <ArrowRight size={16} />}
        </div>
      </div>
    </motion.div>
  );
}

export default PersonaCard;
