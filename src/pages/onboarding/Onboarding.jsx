// Onboarding.jsx — Progressive 5-step intellectual space configuration flow
// Zero emoji, Lucide icons, light-first theme support, and space completion moment.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Brain,
  Sparkles,
  BookOpen,
  Check,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { NeuralBackground } from "../../components/chat/NeuralBackground";
import { mockPersonas } from "../../data/mockPersonas";

const GOALS = [
  { id: "explore", label: "Explore Ideas", desc: "Deep-dive into philosophy, faith, and timeless concepts" },
  { id: "perspective", label: "Find Perspective", desc: "Gain fresh clarity on personal and ethical questions" },
  { id: "teachings", label: "Study Teachings", desc: "Examine certified books, sermons, and historical essays" },
  { id: "leadership", label: "Understand Leadership", desc: "Learn principles of impact, potential, and governance" },
];

const CATEGORIES = [
  { id: "faith", label: "Faith & Spiritual Depth" },
  { id: "leadership", label: "Leadership & Purpose" },
  { id: "literature", label: "Literature & Authentic Voice" },
  { id: "culture", label: "Modern Culture & Dialectic" },
];

const PREFERENCES = [
  { id: "detailed", label: "Detailed Explanations", desc: "Comprehensive responses with thorough textual citations" },
  { id: "guidance", label: "Practical Guidance", desc: "Actionable wisdom grounded in direct teachings" },
  { id: "concise", label: "Concise Summaries", desc: "Sharp, high-level insights for quick reading" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("explore");
  const [selectedCategory, setSelectedCategory] = useState("faith");
  const [selectedMinds, setSelectedMinds] = useState(["persona-01"]);
  const [selectedPref, setSelectedPref] = useState("detailed");

  const navigate = useNavigate();

  const toggleMind = (id) => {
    setSelectedMinds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    navigate("/app/library");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Neural Canvas */}
      <NeuralBackground opacity={0.06} />

      {/* Top Header */}
      <header className="p-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
            <Brain size={18} />
          </div>
          <span className="font-bold text-base text-[var(--color-text-primary)]">Persona</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => navigate("/app/library")}
            className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] font-medium"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Main Step Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 px-1">
            <span className="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">
              Step 0{step} of 05
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300",
                    s === step
                      ? "w-8 bg-[var(--color-accent)]"
                      : s < step
                      ? "w-4 bg-[var(--color-accent)]/40"
                      : "w-2 bg-[var(--color-border)]"
                  )}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
                    What brings you here?
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5">
                    Select your primary intention to customize your persona workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {GOALS.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={clsx(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                        selectedGoal === g.id
                          ? "bg-[var(--color-bg-elevated)] border-[var(--color-accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--color-accent)]/30"
                          : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{g.label}</h3>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{g.desc}</p>
                      </div>
                      {selectedGoal === g.id && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-button-text)] flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
                    What are you curious about?
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5">
                    Select the domain of knowledge you want to explore first.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={clsx(
                        "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28",
                        selectedCategory === c.id
                          ? "bg-[var(--color-bg-elevated)] border-[var(--color-accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--color-accent)]/30"
                          : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{c.label}</h3>
                      {selectedCategory === c.id && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-button-text)] flex items-center justify-center self-end">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
                    Choose minds to begin with.
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5">
                    Select one or more certified personas for your initial space.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockPersonas.map((p) => {
                    const isSelected = selectedMinds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleMind(p.id)}
                        className={clsx(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5",
                          isSelected
                            ? "bg-[var(--color-bg-elevated)] border-[var(--color-accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--color-accent)]/30"
                            : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                        )}
                      >
                        <Avatar src={p.avatar} name={p.name} gradient={p.avatarGradient} size="md" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{p.name}</h3>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{p.tagline}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-button-text)] flex items-center justify-center flex-shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
                    Conversation preference
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5">
                    How would you like Persona models to structure their responses?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {PREFERENCES.map((pref) => (
                    <div
                      key={pref.id}
                      onClick={() => setSelectedPref(pref.id)}
                      className={clsx(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                        selectedPref === pref.id
                          ? "bg-[var(--color-bg-elevated)] border-[var(--color-accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--color-accent)]/30"
                          : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{pref.label}</h3>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{pref.desc}</p>
                      </div>
                      {selectedPref === pref.id && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-button-text)] flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto shadow-[var(--shadow-accent)]">
                  <Sparkles size={36} />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
                    Your space is ready.
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                    Your personalized knowledge workspace has been configured with your selected minds and topic filters.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Actions */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-base)] font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-8 py-3.5 rounded-full bg-[var(--color-accent)] text-[var(--color-button-text)] font-bold text-xs shadow-lg hover:bg-[var(--color-accent-glow)] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Enter Persona Space</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
