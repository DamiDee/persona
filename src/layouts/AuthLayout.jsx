// AuthLayout.jsx — Desktop split-screen storytelling layout & mobile centered auth

import { Outlet, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { NeuralBackground } from "../components/chat/NeuralBackground";
import { useAuthStore } from "../store/useAuthStore";
import { mockPersonas } from "../data/mockPersonas";

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app/library" replace />;
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-[#f3f4f6] font-sans flex relative overflow-hidden">
      {/* Subtle Neural Background */}
      <NeuralBackground opacity={0.06} />

      {/* LEFT PANEL: DESKTOP BRAND STORYTELLING & FLOATING ARTWORK (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0c0e12] border-r border-white/[0.06] p-12 flex-col justify-between overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"
        />

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-cyan-400">
            <Brain size={20} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Persona</span>
        </Link>

        {/* Center Storytelling Hero */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-cyan-300">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Private Knowledge Workspace</span>
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
            Conversations with{" "}
            <span className="font-serif italic font-normal text-cyan-300">
              minds that shaped you.
            </span>
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Enter an intelligent reading environment grounded in the teachings, speeches, and books of remarkable historical and modern figures.
          </p>

          {/* Persona Avatars Showcase Strip */}
          <div className="pt-4 flex items-center gap-3">
            {mockPersonas.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="w-11 h-11 rounded-full border border-white/20 p-0.5 bg-zinc-900 shadow-md relative group"
                title={p.name}
              >
                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full" />
              </div>
            ))}
            <span className="text-xs text-zinc-500 font-medium ml-2">
              4 Certified Minds
            </span>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-500 font-mono">
            "Stories and teachings matter enormously — they shape how we see the world."
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-cyan-400">
                <Brain size={20} />
              </div>
              <span className="text-white font-bold text-xl">Persona</span>
            </Link>
            <p className="text-xs text-zinc-400 font-serif italic">
              Conversations with minds that shaped you
            </p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
