// Home.jsx — Premium, Apple-style Homepage with dynamic interactive features

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Sparkles, MessageSquare, Mic, Volume2, Database, Compass, Lock, Code, Languages, Brain, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { NeuralBackground } from "../../components/chat/NeuralBackground";

const FEATURE_CATEGORIES = [
  {
    id: 1,
    label: "Core Personality & Traits",
    title: "A unique mind, in every dimension.",
    description: "Fully customizable parameters that determine intellectual background, psychological profiles, and conversational quirks. Experience dialogue shaped by authentic personality weights.",
    type: "avatar-pulse",
  },
  {
    id: 2,
    label: "Voice & Tone Customization",
    title: "Speak with depth and character.",
    description: "Choose between academic, pastoral, literary, or casual tones. Dynamic speech patterns, vocabulary selection, and phrasing structures align with the persona's historical context.",
    type: "audio-wave",
  },
  {
    id: 3,
    label: "Memory & Context Retention",
    title: "Infinite context, seamless continuity.",
    description: "Our personas recall previous threads, teachings, and references, building deep long-term relationship context. Revisit complex ideas over time without resetting knowledge.",
    type: "memory-mesh",
  },
  {
    id: 4,
    label: "Interactive Scenarios & Roles",
    title: "Scripted journeys and open debates.",
    description: "Engage in guided mentorship simulations, theological inquiries, or classic philosophical dialectics. Perfect for structured learning or open-ended debates.",
    type: "chat-sim",
  },
  {
    id: 5,
    label: "Multi-Language Support",
    title: "A global conversation.",
    description: "Engage with historic voices translated in real-time to over 40 languages, preserving their original semantic nuance and tone of voice without manual conversion.",
    type: "lang-globe",
  },
  {
    id: 6,
    label: "Integration & API Tools",
    title: "Extend minds to your own applications.",
    description: "Deploy custom personas directly into your workflow, Discord servers, or custom software using our fast REST endpoints and real-time streaming API.",
    type: "code-terminal",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 14 } 
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [typedCode, setTypedCode] = useState("");
  const navigate = useNavigate();

  // Typing simulation effect for API Tab
  useEffect(() => {
    if (activeTab === 5) {
      const codeSnippet = `const persona = new Persona("Joshua Selman");\nawait persona.sendMessage("Tell me about faith...");\npersona.onStream((token) => process.stdout.write(token));`;
      let i = 0;
      setTypedCode("");
      const timer = setInterval(() => {
        if (i < codeSnippet.length) {
          setTypedCode((prev) => prev + codeSnippet.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const activeFeature = FEATURE_CATEGORIES[activeTab];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-x-hidden selection:bg-cyan-500/10 transition-colors duration-300">
      {/* Background Neural Network grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralBackground opacity={0.06} />
      </div>

      {/* Floating Apple-Style Nav Header */}
      <header className="sticky top-0 z-50 w-full h-12 bg-white/70 backdrop-blur-md border-b border-black/[0.08] px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/1.png" alt="Persona Logo" className="w-8 h-8 object-contain" />
            <span className="text-[#1D1D1F] font-semibold text-[14px] tracking-tight">Persona</span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#closer-look" className="text-[12px] text-[#1D1D1F]/80 font-normal hover:text-[#1D1D1F] transition-colors duration-200">Features</a>
              <a href="#bento-capabilities" className="text-[12px] text-[#1D1D1F]/80 font-normal hover:text-[#1D1D1F] transition-colors duration-200">Capabilities</a>
              <Link to="/onboarding" className="text-[12px] text-[#1D1D1F]/80 font-normal hover:text-[#1D1D1F] transition-colors duration-200">Onboarding</Link>
              <Link to="/login" className="text-[12px] text-[#1D1D1F]/80 font-normal hover:text-[#1D1D1F] transition-colors duration-200">Sign In</Link>
            </nav>
            <button
              onClick={() => navigate("/app/library")}
              className="bg-black text-white text-[12px] font-medium px-3 py-1 rounded-full shadow-sm hover:bg-[#0077ED] transition-colors duration-200 cursor-pointer"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center space-y-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200/80 text-[13px] font-semibold shadow-sm"
        >
          <Sparkles size={14} className="text-cyan-600 animate-pulse" />
          <span>Announcing Premium Personas ✦</span>
        </motion.div>

        <h1
          className="text-[#1D1D1F] font-extrabold tracking-tight leading-[1.08] max-w-4xl"
          style={{ fontSize: "clamp(2.75rem, 8vw, 4.75rem)" }}
        >
          Conversations with the minds that shaped culture.
        </h1>

        <p className="text-[#86868B] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Unlock interactive access to verified historical and intellectual giants, structured directly from their corpus of books, letters, and teachings.
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/onboarding")}
            className="px-7 py-4 bg-black text-white font-bold text-[15px] rounded-full shadow-md flex items-center gap-2 hover:opacity-90 transition-all duration-200 cursor-pointer"
          >
            Start Onboarding
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/app/library")}
            className="px-7 py-4 bg-white border border-zinc-200 text-[#1D1D1F] font-bold text-[15px] rounded-full shadow-sm hover:bg-zinc-50 transition-all duration-200 cursor-pointer"
          >
            Browse Library
          </button>
        </div>
      </section>

      {/* Take a Closer Look: Features showcase */}
      <section id="closer-look" className="relative z-10 py-28 bg-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 space-y-2">
            <span className="text-[12px] font-bold tracking-[0.12em] uppercase text-cyan-600">Deep Customization</span>
            <h2 className="text-[#1D1D1F] text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Take a closer look.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: interactive tab menu */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 items-start">
              {FEATURE_CATEGORIES.map((cat, idx) => {
                const isActive = activeTab === idx;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveTab(idx)}
                    whileHover={{ scale: 1.015, x: 6 }}
                    whileTap={{ scale: 0.985 }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-6 py-3.5 rounded-full text-left font-semibold text-[15px] border cursor-pointer",
                      "transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]",
                      isActive
                        ? "bg-black text-white border-transparent shadow-md"
                        : "bg-black/5 text-[#86868B] border-transparent hover:bg-black/10"
                    )}
                  >
                    <div className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
                      isActive ? "border-white/30" : "border-zinc-400"
                    )}>
                      <Plus size={11} strokeWidth={3} className={clsx("transition-transform duration-300", isActive && "rotate-45")} />
                    </div>
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right side: dynamic graphic canvas */}
            <div className="lg:col-span-7 flex flex-col justify-center items-center h-[450px] rounded-[36px] bg-[#F5F5F7] border border-zinc-200 p-8 shadow-inner relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full h-full flex flex-col justify-center items-center text-center space-y-6"
                >
                  {/* Dynamic Graphic Container */}
                  <div className="flex-1 w-full flex items-center justify-center">
                    
                    {/* Visual 1: Avatar Pulse */}
                    {activeFeature.type === "avatar-pulse" && (
                      <motion.div className="relative w-48 h-48 flex items-center justify-center" variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div
                          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.05, 0.4] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full border-2 border-cyan-500/80"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.45, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                          className="absolute inset-0 rounded-full border border-cyan-400/50"
                        />
                        <motion.div 
                          variants={itemVariants} 
                          className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20 z-10"
                        >
                          <Brain size={40} className="text-white" />
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Visual 2: Audio Wave */}
                    {activeFeature.type === "audio-wave" && (
                      <motion.div className="flex items-end gap-2.5 h-24" variants={containerVariants} initial="hidden" animate="visible">
                        {[0.3, 0.6, 0.9, 0.4, 0.7, 1, 0.5, 0.8, 0.4, 0.6, 0.3].map((h, i) => (
                          <motion.div
                            key={i}
                            variants={itemVariants}
                            animate={{ scaleY: [1, 1.5, 0.8, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                            className="w-3 rounded-full bg-gradient-to-t from-cyan-500 via-indigo-500 to-purple-500 origin-bottom"
                            style={{ height: `${h * 70}px` }}
                          />
                        ))}
                      </motion.div>
                    )}

                    {/* Visual 3: Memory Mesh */}
                    {activeFeature.type === "memory-mesh" && (
                      <motion.div className="relative w-full max-w-[340px] h-48 flex items-center justify-center" variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants} className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center z-10 shadow-sm">
                          <Database size={24} className="text-cyan-600 animate-pulse" />
                        </motion.div>
                        {[
                          { top: "10%", left: "15%", label: "Sermons" },
                          { top: "12%", right: "12%", label: "Books" },
                          { bottom: "10%", left: "18%", label: "Speeches" },
                          { bottom: "15%", right: "15%", label: "Letters" }
                        ].map((node, i) => (
                          <motion.div
                            key={i}
                            variants={itemVariants}
                            className="absolute px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-[11px] font-semibold shadow-sm flex items-center gap-1.5 z-20"
                            style={{ top: node.top, left: node.left, right: node.right }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                            <span>{node.label}</span>
                          </motion.div>
                        ))}
                        {/* Connecting Line Vector */}
                        <svg className="absolute inset-0 w-full h-full stroke-cyan-500/15" fill="none">
                          <line x1="25%" y1="20%" x2="50%" y2="50%" strokeWidth={1} />
                          <line x1="80%" y1="20%" x2="50%" y2="50%" strokeWidth={1} />
                          <line x1="28%" y1="85%" x2="50%" y2="50%" strokeWidth={1} />
                          <line x1="75%" y1="80%" x2="50%" y2="50%" strokeWidth={1} />
                        </svg>
                      </motion.div>
                    )}

                    {/* Visual 4: Chat Sim (Sleek Apple style message bubbles) */}
                    {activeFeature.type === "chat-sim" && (
                      <motion.div className="w-full max-w-[340px] space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                        {/* Assistant Message */}
                        <motion.div variants={itemVariants} className="flex gap-2.5 items-start">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-[11px] text-white font-bold shadow-sm">
                            AJS
                          </div>
                          <div className="bg-zinc-200/90 text-zinc-950 px-4 py-2.5 rounded-2xl rounded-tl-none text-[13px] leading-relaxed shadow-sm">
                            To lead effectively, one must first learn to serve.
                          </div>
                        </motion.div>
                        {/* User Message */}
                        <motion.div variants={itemVariants} className="flex gap-2.5 items-start justify-end">
                          <div className="bg-cyan-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-[13px] leading-relaxed shadow-sm max-w-[80%] text-left">
                            "Does this service apply to all fields of leadership?"
                          </div>
                          <div className="w-8 h-8 rounded-full bg-zinc-300 flex-shrink-0 flex items-center justify-center text-[11px] text-zinc-700 font-bold shadow-sm border border-zinc-200">
                            U
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Visual 5: Globe translations */}
                    {activeFeature.type === "lang-globe" && (
                      <motion.div className="flex flex-col items-center gap-4" variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants}>
                          <Languages size={48} className="text-cyan-600 animate-bounce" />
                        </motion.div>
                        <motion.div className="flex flex-wrap gap-2 justify-center max-w-[280px]" variants={containerVariants}>
                          {["English", "Français", "Español", "Deutsch", "Português"].map((lang, idx) => (
                            <motion.span 
                              key={idx} 
                              variants={itemVariants}
                              className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-[11px] font-semibold shadow-sm text-zinc-700"
                            >
                              {lang}
                            </motion.span>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Visual 6: API terminal */}
                    {activeFeature.type === "code-terminal" && (
                      <div className="w-full max-w-[420px] rounded-2xl bg-zinc-950 text-left font-mono text-[12px] text-zinc-300 p-4.5 border border-zinc-800 shadow-xl select-none">
                        <div className="flex gap-1.5 pb-2 mb-3 border-b border-zinc-900">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed">
                          <code className="text-cyan-400"># API initialization</code>
                          <br />
                          <code>{typedCode}</code>
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-0.5 align-middle"
                          />
                        </pre>
                      </div>
                    )}

                  </div>

                  {/* Text Description */}
                  <div className="max-w-md space-y-1.5">
                    <h3 className="text-lg font-bold text-[#1D1D1F]">
                      {activeFeature.title}
                    </h3>
                    <p className="text-[13.5px] text-[#86868B] leading-relaxed">
                      {activeFeature.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Capabilities gallery */}
      <section id="bento-capabilities" className="relative z-10 py-28 bg-[#F5F5F7] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="space-y-2">
            <span className="text-[12px] font-bold tracking-[0.12em] uppercase text-cyan-600">Core Engine</span>
            <h2 className="text-[#1D1D1F] text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Built for depth.
            </h2>
          </div>

          {/* Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Grounded in raw teachings (Wide - 2 columns span on md) */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="md:col-span-2 rounded-[28px] bg-white p-8 flex flex-col justify-between h-[360px] border border-zinc-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
            >
              <div className="max-w-md space-y-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                  <Database size={18} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                  Strictly grounded in raw teachings.
                </h3>
                <p className="text-[14px] text-[#86868B] leading-relaxed">
                  Persona completely bypasses generic AI hallucinations. Each mind is constrained and dynamically prompts from direct certified sources: books, articles, transcriptions, and teachings.
                </p>
              </div>

              {/* Minimal Graphical preview */}
              <div className="absolute right-0 bottom-0 top-1/3 left-1/2 translate-x-12 translate-y-12 opacity-50 group-hover:opacity-70 transition-all duration-500 ease-out group-hover:scale-105">
                <div className="w-80 h-80 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
                  <div className="w-60 h-60 rounded-full border border-cyan-500/15 bg-cyan-500/5 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border border-cyan-500/10 bg-cyan-500/5" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Floating chat preview */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-[28px] bg-white p-8 flex flex-col justify-between h-[360px] border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B]">Conversation</span>
                <h3 className="text-xl font-bold text-[#1D1D1F]">
                  Natural, fluid dialog.
                </h3>
              </div>

              {/* Chat Simulation Graphic */}
              <div className="space-y-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <div className="bg-zinc-100 border border-zinc-200 px-3.5 py-2 rounded-2xl rounded-bl-none text-[11.5px] leading-relaxed shadow-sm text-zinc-800">
                  "Let your character speak louder than your words."
                </div>
                <div className="bg-cyan-500 text-white px-3.5 py-2 rounded-2xl rounded-br-none text-[11.5px] leading-relaxed ml-auto w-[85%] text-right shadow-sm">
                  "Agreed. That's true integrity."
                </div>
              </div>
            </motion.div>

            {/* Card 3: Premium Speech Synthesis */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-[28px] bg-white p-8 flex flex-col justify-between h-[360px] border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Mic size={18} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F]">
                  Premium Voice Synthesis
                </h3>
                <p className="text-[13.5px] text-[#86868B] leading-relaxed">
                  Hear responses read with original intonations, tone, and pacing (coming soon).
                </p>
              </div>

              {/* Waveform graphic */}
              <div className="flex items-center gap-1.5 h-12 w-full">
                {[0.2, 0.5, 0.8, 0.3, 0.9, 0.6, 0.2, 0.5, 0.7, 0.4, 0.8, 0.3].map((h, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ scaleY: [h, h * 1.8, h] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.06 }}
                    className="flex-1 h-full bg-purple-500/25 rounded-full origin-center group-hover:bg-purple-500/40"
                  />
                ))}
              </div>
            </motion.div>

            {/* Card 4: Millions of Ingested Words (Wide - 2 columns span) */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="md:col-span-2 rounded-[28px] bg-white p-8 flex flex-col justify-between h-[360px] border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group"
            >
              <div className="max-w-md space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Volume2 size={18} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                  Over 12.5M+ words indexed.
                </h3>
                <p className="text-[14px] text-[#86868B] leading-relaxed">
                  Our semantic dataset indexes thousands of documents to retrieve paragraphs with high mathematical precision. We guarantee strict alignment with teachings.
                </p>
              </div>

              {/* Stats dashboard panel visual */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-zinc-100 transition-colors group-hover:border-zinc-200">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <p className="text-[24px] font-bold text-[#1D1D1F]">12.5M+</p>
                  <p className="text-[11px] text-[#86868B] uppercase tracking-wider font-semibold">Words Indexed</p>
                </div>
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <p className="text-[24px] font-bold text-[#1D1D1F]">100%</p>
                  <p className="text-[11px] text-[#86868B] uppercase tracking-wider font-semibold">Teaching Match</p>
                </div>
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <p className="text-[24px] font-bold text-[#1D1D1F]">&lt;1.5s</p>
                  <p className="text-[11px] text-[#86868B] uppercase tracking-wider font-semibold">Response Speed</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <section className="relative z-10 py-24 bg-white text-center border-t border-zinc-200 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F]">
            Begin your conversation.
          </h2>
          <p className="text-[#86868B] text-base leading-relaxed">
            Choose a Persona from our catalog and engage in conversations that spark new perspectives, insights, and wisdom.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/onboarding")}
              className="px-8 py-3.5 bg-black text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-[#F5F5F7] border-t border-zinc-200 text-center text-[12px] text-[#86868B] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <img src="/1.png" alt="Persona Logo" className="w-100 h-10 object-contain opacity-70" />
            <span className="font-semibold text-zinc-600"></span>
          </div>
          <p>© 2026 Persona. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
