// PersonaInspectorDrawer.jsx — Slide-over context & model telemetry drawer for the active Persona

import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Cpu,
  Flame,
  Layers,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
  X,
  ArrowUpRight,
  Radio,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { useChatStore } from "../../store/useChatStore";
import { resolveApiPersonaId } from "../../data/mockPersonas";

export function PersonaInspectorDrawer({
  isOpen,
  onClose,
  persona,
  onSelectPrompt,
  onOpenSources,
}) {
  const {
    warmupStatus,
    apiMode,
    setApiModalOpen,
    warmupGpu,
    personas,
    createNewChat,
  } = useChatStore();

  if (!persona) return null;

  const apiSlug = resolveApiPersonaId(persona);
  const totalSources =
    persona.sourceMaterial?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile/tablet backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] xl:hidden"
          />

          <motion.aside
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 bottom-0 xl:static z-40 w-[320px] sm:w-[340px] flex-shrink-0 h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] flex flex-col overflow-hidden font-sans shadow-2xl xl:shadow-none"
            aria-label="Persona context and model inspector"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[var(--color-accent)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Mind &amp; Pipeline
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                aria-label="Close inspector"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
              {/* Persona Identity Card */}
              <div className="relative p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--color-accent)]/10 blur-2xl pointer-events-none" />
                <div className="relative flex items-center gap-3.5">
                  <Avatar
                    src={persona.avatar}
                    name={persona.name}
                    gradient={persona.avatarGradient}
                    size="md"
                    animated
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate">
                        {persona.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-mono text-[10px] font-bold">
                        {apiSlug}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                      {persona.tagline}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {persona.bio}
                </p>
              </div>

              {/* Live Serving Pipeline Card */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                    <Cpu size={12} className="text-[var(--color-accent)]" />
                    Serving Pipeline
                  </span>
                  <button
                    type="button"
                    onClick={() => setApiModalOpen(true)}
                    className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    Configure
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-tertiary)]">
                      Engine
                    </span>
                    <span className="font-mono font-semibold text-[var(--color-text-primary)] text-[11px]">
                      {apiMode === "live" ? "Modal vLLM (L40S)" : "Demo Simulator"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-tertiary)]">
                      LoRA Adapter
                    </span>
                    <span className="font-mono font-semibold text-[var(--color-accent)] text-[11px]">
                      {apiSlug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-tertiary)]">
                      GPU State
                    </span>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 font-semibold text-[11px]",
                        warmupStatus === "warm"
                          ? "text-emerald-500"
                          : warmupStatus === "warming"
                          ? "text-amber-500"
                          : "text-[var(--color-text-secondary)]"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          warmupStatus === "warm"
                            ? "bg-emerald-500"
                            : warmupStatus === "warming"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-zinc-400"
                        )}
                      />
                      {warmupStatus === "warm"
                        ? "Warm (~2s TTFT)"
                        : warmupStatus === "warming"
                        ? "Waking GPU..."
                        : warmupStatus === "auth_required"
                        ? "Key Required"
                        : "Scale-to-Zero"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[var(--color-text-tertiary)]">
                      Guardrails
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                      <ShieldCheck size={12} /> Crisis Detection Active
                    </span>
                  </div>
                </div>

                {apiMode === "live" && warmupStatus !== "warm" && (
                  <button
                    type="button"
                    onClick={() => warmupGpu({ force: true })}
                    disabled={warmupStatus === "warming"}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/25 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Flame size={13} />
                    <span>
                      {warmupStatus === "warming"
                        ? "Waking Modal GPU..."
                        : "Trigger POST /v1/warmup"}
                    </span>
                  </button>
                )}
              </div>

              {/* Grounded Corpus Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[var(--color-accent)]" />
                    Source Corpus ({totalSources})
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSources}
                    className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    Attach +
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(persona.sourceMaterial || []).map((src) => (
                    <div
                      key={src.type}
                      className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center"
                    >
                      <p className="text-sm font-extrabold text-[var(--color-text-primary)]">
                        {src.count}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] truncate mt-0.5">
                        {src.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Prompts */}
              {persona.suggestedPrompts?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] px-1 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[var(--color-accent)]" />
                    Suggested Inquiries
                  </span>
                  <div className="space-y-1.5">
                    {persona.suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => onSelectPrompt?.(prompt)}
                        className="w-full p-2.5 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-left text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-start justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <span className="leading-snug">{prompt}</span>
                        <ArrowUpRight
                          size={13}
                          className="shrink-0 mt-0.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Switch Persona */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] px-1 flex items-center gap-1.5">
                  <Radio size={11} className="text-[var(--color-accent)]" />
                  Switch Persona
                </span>
                <div className="space-y-1.5">
                  {personas
                    .filter((p) => !p.isPremium && p.id !== persona.id)
                    .map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => createNewChat(other.id)}
                        className="w-full p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center gap-2.5 text-left transition-all cursor-pointer"
                      >
                        <Avatar
                          src={other.avatar}
                          name={other.name}
                          gradient={other.avatarGradient}
                          size="xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                            {other.name}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                            {other.tagline}
                          </p>
                        </div>
                        <MessageSquarePlus
                          size={13}
                          className="text-[var(--color-text-tertiary)] shrink-0"
                        />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default PersonaInspectorDrawer;

