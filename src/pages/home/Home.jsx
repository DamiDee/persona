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
  Layers,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { NeuralBackground } from "../../components/chat/NeuralBackground";
import { ProductLogo } from "../../components/ui/ProductLogo";
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

  // Restore section deep-links after the client-rendered page has mounted.
  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) window.scrollTo(0, target.offsetTop);
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

      {/* Floating glass navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="glass-nav max-w-6xl mx-auto w-full h-[66px] rounded-[22px] px-3 sm:px-4 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Persona home" className="shrink-0 rounded-xl overflow-hidden shadow-sm">
            <ProductLogo compact />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-white/75">
            <a href="#minds" className="hover:text-white transition-colors">
              <span className="block px-3.5 py-2 rounded-full hover:bg-white/10">Minds</span>
            </a>
            <a href="#process" className="hover:text-white transition-colors">
              <span className="block px-3.5 py-2 rounded-full hover:bg-white/10">Architecture</span>
            </a>
            <Link to="/onboarding" className="hover:text-white transition-colors">
              <span className="block px-3.5 py-2 rounded-full hover:bg-white/10">Onboarding</span>
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              <span className="block px-3.5 py-2 rounded-full hover:bg-white/10">Sign In</span>
            </Link>
          </nav>

          <button
            onClick={() => navigate("/app/library")}
            className="px-4 sm:px-5 py-2.5 rounded-full bg-white !text-[#111318] font-bold text-xs hover:bg-cyan-50 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>Explore</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* HERO SECTION — PROMPT-FIRST EXPERIENTIAL COMPOSITION */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Full-bleed hero background without opacity */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-[url('/hero_1.jpg')] bg-center bg-cover bg-no-repeat w-full h-full opacity-100" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.12)_0%,rgba(3,7,18,0.02)_48%,rgba(3,7,18,0.46)_100%)]" />
            <div className="absolute inset-y-0 left-0 w-[52%] bg-[radial-gradient(circle_at_18%_52%,rgba(34,211,238,0.16),transparent_58%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="hidden xl:flex absolute left-[5%] top-[48%] z-20 glass-nav rounded-[20px] p-3.5 items-center gap-3"
          >
            <div className="flex -space-x-2">
              {mockPersonas.slice(0, 3).map((persona) => (
                <img key={persona.id} src={persona.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-900" />
              ))}
            </div>
            <div>
              <p className="!text-white text-xs font-bold">Verified minds</p>
              <p className="!text-white/55 text-[10px]">Distinct voices, grounded sources</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden xl:flex absolute right-[5%] top-[57%] z-20 glass-nav rounded-[20px] p-3.5 items-center gap-3"
          >
            <span className="w-9 h-9 rounded-xl bg-cyan-400/15 text-cyan-300 flex items-center justify-center border border-cyan-300/20">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="!text-white text-xs font-bold">Citation ready</p>
              <p className="!text-white/55 text-[10px]">Every answer can be traced</p>
            </div>
          </motion.div>

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
                  "composer-aura relative rounded-[26px] transition-all duration-300",
                  "bg-[#0c1018]/88 backdrop-blur-2xl border border-white/15 p-4 sm:p-5 text-left shadow-[0_24px_80px_rgba(3,7,18,0.32)]",
                  isFocused
                    ? "border-cyan-300/65 ring-4 ring-cyan-300/10"
                    : "hover:border-white/25"
                )}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Left Source Attach Button */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/25 text-white/65 hover:text-white transition-all text-xs font-semibold cursor-pointer"
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
                      className="w-full bg-transparent !text-white placeholder:!text-white/40 text-sm sm:text-base font-medium focus:outline-none resize-none py-1.5 font-sans leading-relaxed"
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
                  className="px-3.5 py-1.5 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-md border border-white/15 text-xs font-medium !text-white/75 hover:!text-white transition-all cursor-pointer"
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
        <section id="minds" className="relative z-10 py-24 sm:py-32 border-t border-[var(--color-border)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_18%_20%,var(--color-accent-subtle),transparent_58%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
            <div className="grid lg:grid-cols-[1fr_0.7fr] items-end gap-6 lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--color-accent)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  Curated perspectives
                </span>
                <h2 className="mt-5 text-4xl sm:text-5xl lg:text-[64px] leading-[0.96] font-extrabold tracking-[-0.05em] text-[var(--color-text-primary)]">
                  Meet the minds
                  <span className="font-serif italic font-normal"> behind the ideas.</span>
                </h2>
              </div>
              <div className="lg:pb-1">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--color-text-secondary)] max-w-lg">
                  Move beyond summaries. Explore a living catalog of distinctive thinkers, each grounded in a verified body of work.
                </p>
                <Link
                  to="/app/library"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <span>Explore the full catalog</span>
                  <span className="w-8 h-8 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center">
                    <ChevronRight size={14} />
                  </span>
                </Link>
              </div>
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
