// AppLayout.jsx — Persistent shell with left navigation sidebar, top bar, and route outlet
// Protected: redirects to /login if unauthenticated.

import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronRight } from "lucide-react";
import { Sidebar } from "../components/chat/Sidebar";
import { MobileDrawer } from "../components/chat/MobileDrawer";
import { NeuralBackground } from "../components/chat/NeuralBackground";
import { Avatar } from "../components/ui/Avatar";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const {
    sidebarCollapsed,
    toggleSidebar,
    getActivePersona,
  } = useChatStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activePersona = getActivePersona();

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] relative font-sans transition-colors duration-300">
      {/* Subtle Neural Network background */}
      <NeuralBackground opacity={0.05} />

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
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] safe-top transition-colors duration-300">
          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <Menu size={18} />
          </button>

          {/* Active Persona Indicator */}
          <div className="flex items-center gap-2.5 mx-auto lg:mx-0">
            {activePersona ? (
              <div
                onClick={() => navigate("/app/library")}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Avatar
                  src={activePersona.avatar}
                  name={activePersona.name}
                  gradient={activePersona.avatarGradient}
                  size="sm"
                  animated={false}
                />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-none">
                    {activePersona.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
                      Grounded Active
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

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate("/app/library")}
              className="px-3.5 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
