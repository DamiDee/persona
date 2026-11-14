import { Outlet, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { ProductLogo } from "../components/ui/ProductLogo";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/useAuthStore";
import { mockPersonas } from "../data/mockPersonas";

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app/library" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans flex relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_15%,var(--color-accent-subtle),transparent_38%)]" />

      {/* Brand story panel */}
      <section className="hidden lg:flex lg:w-[52%] relative m-4 mr-0 rounded-[32px] overflow-hidden p-10 xl:p-12 flex-col justify-between min-h-[calc(100vh-32px)] border border-white/10 shadow-[0_28px_90px_rgba(3,7,18,0.2)]">
        <div className="absolute inset-0 bg-[url('/hero_1.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,7,18,0.9)_0%,rgba(8,47,73,0.68)_48%,rgba(30,41,59,0.5)_100%)]" />
        <motion.div
          animate={{ x: [0, 50, -25, 0], y: [0, -35, 25, 0], scale: [1, 1.15, 0.94, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[18%] top-[26%] w-80 h-80 bg-cyan-400/15 blur-[100px] rounded-full"
        />

        <Link to="/" className="relative z-10 w-fit rounded-2xl shadow-lg">
          <ProductLogo />
        </Link>

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.14] text-[11px] font-bold tracking-[0.12em] uppercase text-cyan-200">
            <Sparkles size={12} /> Your private knowledge space
          </span>

          <h1 className="mt-6 text-5xl xl:text-[64px] leading-[0.98] font-extrabold tracking-[-0.05em] !text-white">
            Pick up where your
            <span className="font-serif italic font-normal text-cyan-200"> curiosity left off.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm xl:text-base leading-relaxed !text-white/65">
            Return to conversations grounded in verified books, teachings, interviews, and ideas from remarkable minds.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
            <div className="glass-nav rounded-[18px] p-4">
              <BookOpen size={16} className="text-cyan-300" />
              <p className="mt-3 text-xl font-bold !text-white">180+</p>
              <p className="text-[10px] !text-white/50">Curated source materials</p>
            </div>
            <div className="glass-nav rounded-[18px] p-4">
              <ShieldCheck size={16} className="text-cyan-300" />
              <p className="mt-3 text-xl font-bold !text-white">Source-first</p>
              <p className="text-[10px] !text-white/50">Traceable conversations</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-5 pt-7 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {mockPersonas.slice(0, 4).map((persona) => (
                <img
                  key={persona.id}
                  src={persona.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full border-2 border-slate-900 object-cover object-top"
                />
              ))}
            </div>
            <span className="text-[11px] font-medium !text-white/55">Four certified minds</span>
          </div>
          <Quote size={18} className="text-white/35" />
        </div>
      </section>

      {/* Authentication workspace */}
      <section className="w-full lg:w-[48%] min-h-screen flex items-center justify-center p-5 sm:p-10 xl:p-14 relative z-10">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-7">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[460px] pt-16 lg:pt-0">
          <div className="lg:hidden mb-8 flex flex-col items-center text-center">
            <Link to="/" className="rounded-2xl shadow-md">
              <ProductLogo />
            </Link>
            <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
              Conversations with minds that shaped you
            </p>
          </div>

          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
