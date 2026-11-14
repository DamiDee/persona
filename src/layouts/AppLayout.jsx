// AppLayout.jsx — Persistent shell with left navigation sidebar, top bar with Modal API status & ThemeToggle, and route outlet
// Protected: redirects to /login if unauthenticated.

import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronRight,
  Cpu,
  Flame,
  KeyRound,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { Sidebar } from "../components/chat/Sidebar";
import { MobileDrawer } from "../components/chat/MobileDrawer";
import { NeuralBackground } from "../components/chat/NeuralBackground";
import { Avatar } from "../components/ui/Avatar";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { resolveApiPersonaId } from "../data/mockPersonas";

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const {
    sidebarCollapsed,
    toggleSidebar,
    getActivePersona,
    warmupStatus,
    apiMode,
    setApiModalOpen,
  } = useChatStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activePersona = getActivePersona();
  const apiSlug = resolveApiPersonaId(activePersona);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] relative font-sans transition-colors duration-300">
      {/* Subtle Neural Network background */}
      <NeuralBackground opacity={0.04} />

      {/* Desktop Navigation Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onOpenLibrary={() => navigate("/app/library")}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenLibrary={() => navigate("/app/library")}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--color-border)] safe-top transition-colors duration-300">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
            >
              <Menu size={17} />
            </button>

            {/* Active Persona Indicator */}
            {activePersona ? (
              <div
                onClick={() => navigate("/app/library")}
                className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              >
                <Avatar
                  src={activePersona.avatar}
                  name={activePersona.name}
                  gradient={activePersona.avatarGradient}
                  size="sm"
                  animated={false}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-[13px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-none truncate">
                      {activePersona.name}
                    </p>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-mono text-[9px] font-bold uppercase">
                      {apiSlug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        warmupStatus === "warm"
                          ? "bg-emerald-500"
                          : warmupStatus === "warming"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-[var(--color-accent)]"
                      )}
                    />
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono truncate">
                      {activePersona.tagline}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/app/library")}
                className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-medium cursor-pointer"
              >
                <span>Choose a Persona</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Right Controls: Modal GPU Status Pill, Theme Toggle, Library */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setApiModalOpen(true);
                if (!window.location.pathname.includes("/chat")) {
                  navigate("/app/chat");
                }
              }}
              className={clsx(
                "px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                warmupStatus === "auth_required" && apiMode === "live"
                  ? "bg-amber-500/10 border-amber-500/35 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
                  : warmupStatus === "warm" && apiMode === "live"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                  : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="Modal Serving API & L40S GPU Status"
            >
              {apiMode === "demo" ? (
                <>
                  <Sparkles size={12} className="text-[var(--color-accent)]" />
                  <span className="hidden xs:inline">Demo Mode</span>
                </>
              ) : warmupStatus === "auth_required" ? (
                <>
                  <KeyRound size={12} />
                  <span>Set API Key</span>
                </>
              ) : warmupStatus === "warming" ? (
                <>
                  <Flame size={12} className="text-amber-500 animate-pulse" />
                  <span>Waking GPU...</span>
                </>
              ) : warmupStatus === "warm" ? (
                <>
                  <Flame size={12} className="text-emerald-500" />
                  <span className="hidden sm:inline">GPU Warm</span>
                  <span className="font-mono text-[10px] opacity-80">~2s</span>
                </>
              ) : (
                <>
                  <Cpu size={12} className="text-[var(--color-accent)]" />
                  <span className="hidden sm:inline">Modal API</span>
                </>
              )}
            </button>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <button
              onClick={() => navigate("/app/library")}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              Browse Minds
            </button>
          </div>
        </header>

        {/* Dynamic Route Outlet */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
