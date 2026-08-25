// Home.jsx — Light-First, Editorial, Award-Worthy Landing Experience for Persona
// Warm off-white surfaces, Cormorant Garamond serif typography, architectural process map, zero emoji, Lucide icons.

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  BookOpen,
  Database,
  Brain,
  Layers,
  ChevronRight,
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  MessageSquare,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { NeuralBackground } from "../../components/chat/NeuralBackground";
import { PersonaCard } from "../../components/ui/PersonaCard";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import SourcePickerModal from "../../components/home/SourcePickerModal";
import ProcessRoadmap from "../../components/home/ProcessRoadmap";
import StackedPersonaDeck from "../../components/home/StackedPersonaDeck";
import { mockPersonas } from "../../data/mockPersonas";
import { useChatStore } from "../../store/useChatStore";
import { useToast } from "../../components/ui/Toast";

const ROTATING_QUESTIONS = [
  "How do I discover my purpose?",
  "What does real leadership require?",
  "Help me understand faith in difficult times.",
  "What does meaningful success look like?",
  "What is the danger of a single story?",
];

const SUGGESTED_QUESTIONS = [
  { id: 1, text: "How do I discover my purpose?" },
  { id: 2, text: "What makes someone a great leader?" },
  { id: 3, text: "How do I stay grounded in difficult seasons?" },
  { id: 4, text: "What is the danger of a single story?" },
];

const PROCESS_MILESTONES = [
  {
    step: "01",
    title: "SOURCE",
    subtitle: "Raw Teachings & Works",
    desc: "Built directly from certified books, sermons, lectures, essays, and audio transcripts.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "CURATION",
    subtitle: "Editorial Verification",
    desc: "Relevant corpus material is extracted, verified, and structured for maximum context fidelity.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "INDEXING",
    subtitle: "High-Dimensional Vectorization",
    desc: "Semantic embeddings index paragraphs into dense vector space for instant retrieval.",
    icon: Database,
  },
  {
    step: "04",
    title: "CONTEXT",
    subtitle: "Relational Knowledge Graph",
    desc: "Ideas and citations connect dynamically across topics rather than isolated fragments.",
    icon: Layers,
  },
  {
    step: "05",
    title: "CONVERSATION",
    subtitle: "Zero-Hallucination Dialectic",
    desc: "You ask a question. Persona responds with grounded wisdom from the authentic source.",
    icon: MessageSquare,
  },
];

export default function Home() {
  const [promptText, setPromptText] = useState("");
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();
  const createNewChat = useChatStore((s) => s.createNewChat);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const textareaRef = useRef(null);

  // Auto-rotate suggested prompt placeholder
  useEffect(() => {
    if (promptText || isFocused) return;
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % ROTATING_QUESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promptText, isFocused]);

  const handleSubmitPrompt = (e) => {
    if (e) e.preventDefault();
    const textToSubmit = promptText.trim() || ROTATING_QUESTIONS[rotatingIndex];

    const persona =
      mockPersonas.find((p) =>
        p.suggestedPrompts.some((sp) => sp.toLowerCase().includes(textToSubmit.toLowerCase()))
      ) || mockPersonas[0];

    const chatId = createNewChat(persona.id);
    sendMessage(textToSubmit);
    addToast({
      title: `Connecting with ${persona.name}`,
      description: "Opening your interactive conversation...",
      type: "success",
    });
    navigate(`/app/chat/${chatId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  };

  const handleSelectPersona = (persona) => {
    if (persona.isPremium) {
      navigate("/app/premium");
    } else {
      const chatId = createNewChat(persona.id);
      navigate(`/app/chat/${chatId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-accent-subtle)] selection:text-[var(--color-accent)] overflow-x-hidden relative transition-colors duration-300">
      {/* Background Neural Canvas */}
      <NeuralBackground opacity={0.06} />

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full h-20 px-6 sm:px-10 transition-all duration-300 bg-transparent backdrop-blur-none">
        <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between relative">
          {/* Left Spacer for centering */}
          <div className="hidden md:flex flex-1" />

          {/* Center: Nav Links */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-7 text-xs font-semibold text-white/80">
            <a href="#minds" className="hover:text-white transition-colors">
              Minds
            </a>
            <a href="#process" className="hover:text-white transition-colors">
              Architecture
            </a>
            <Link to="/onboarding" className="hover:text-white transition-colors">
              Onboarding
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </nav>

          {/* Right Side: Action Buttons */}
          <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate("/app/library")}
              className="px-4 py-2 rounded-full bg-white text-zinc-900 font-bold text-xs hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* HERO SECTION — PROMPT-FIRST EXPERIENTIAL COMPOSITION */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Full-bleed hero background without opacity */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-[url('/hero_1.jpg')] bg-center bg-cover bg-no-repeat w-full h-full opacity-100" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32 text-center flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center space-y-6"
            >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white backdrop-blur-sm">
              <Compass size={14} />
              <span>Grounded Knowledge & Idea Engine</span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-4xl">
              <h1
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] !text-white"
                style={{ color: "#ffffff" }}
              >
                What are you trying to{" "}
                <span
                  className="font-serif italic font-normal !text-white"
                  style={{ color: "#ffffff" }}
                >
                  understand?
                </span>
              </h1>

              <p
                className="!text-white text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal"
                style={{ color: "#ffffff" }}
              >
                Have a conversation with a mind whose ideas can help you explore it.
              </p>
            </div>

            {/* FLOATING PROMPT COMPOSER CENTERPIECE */}
            <div className="w-full max-w-3xl pt-6">
              <div
                className={clsx(
                  "relative rounded-3xl transition-all duration-300",
                  "bg-[var(--color-bg-elevated)] border p-4 sm:p-5 text-left shadow-xl",
                  isFocused
                    ? "border-[var(--color-accent)] shadow-[var(--shadow-accent)] ring-1 ring-[var(--color-accent)]/30"
                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                )}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Left Source Attach Button */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-xs font-semibold cursor-pointer"
                  >
                    <BookOpen size={14} className="text-[var(--color-accent)]" />
                    <span>Attach Source</span>
                  </button>

                  {/* Input with Rotating Placeholder */}
                  <div className="flex-1 relative flex items-center min-h-[48px]">
                    <textarea
                      ref={textareaRef}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      rows={1}
                      placeholder={ROTATING_QUESTIONS[rotatingIndex]}
                      className="w-full bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] text-sm sm:text-base font-medium focus:outline-none resize-none py-1.5 font-sans leading-relaxed"
                    />
                  </div>

                  {/* Submit Action Button */}
                  <button
                    onClick={handleSubmitPrompt}
                    className="flex-shrink-0 px-5 py-3 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-[var(--color-button-text)] font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* SUGGESTED CLICKABLE QUESTIONS */}
            <div className="w-full max-w-3xl flex items-center justify-center gap-2 flex-wrap pt-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setPromptText(q.text);
                    textareaRef.current?.focus();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                >
                  "{q.text}"
                </button>
              ))}
            </div>
            </motion.div>
          </div>
        </section>

        <ProcessRoadmap milestones={PROCESS_MILESTONES} />

        {/* SECTION 3: PERSONA DISCOVERY ("Meet the minds") */}
        <section id="minds" className="relative z-10 py-28 border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)]">
                  Certified Catalog
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                  Meet the minds.
                </h2>
              </div>
              <Link
                to="/app/library"
                className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 transition-colors"
              >
                <span>View all Personas</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Stacked Deck of Personas */}
            <div className="w-full">
              <div className="max-w-6xl mx-auto">
                <StackedPersonaDeck personas={mockPersonas} onSelect={handleSelectPersona} />
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER CALL TO ACTION */}
        <section className="relative z-10 py-24 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center">
          <div className="max-w-3xl mx-auto px-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
              Begin your conversation today.
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm max-w-lg mx-auto">
              Explore remarkable minds and discover perspective grounded in authentic teachings.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/app/library")}
                className="px-8 py-3.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] font-bold text-xs rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Browse Persona Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-10 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-tertiary)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/1.png" alt="Persona Logo" className="h-8 w-auto object-contain" />
          <p>© 2026 Persona Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* Material Modal */}
      <SourcePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab="pdf"
        onAttach={() => {
          addToast({
            title: "Source Attached",
            description: "Document context attached to active session.",
            type: "info",
          });
        }}
      />
    </div>
  );
}
