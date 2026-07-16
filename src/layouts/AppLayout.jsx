// AppLayout — persistent shell with sidebar, neural background, route outlet
// Protected: redirects to /login if not authenticated.

import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Info, ChevronRight } from "lucide-react";
import clsx from "clsx";
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
    getActiveConversation,
    personaInfoOpen,
    togglePersonaInfo,
  } = useChatStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const activePersona = getActivePersona();
  const activeConv = getActiveConversation();

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg-base)] relative">
      {/* Neural background — fixed behind everything */}
      <NeuralBackground opacity={0.055} />

      {/* Desktop sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onOpenLibrary={() => navigate("/app/library")}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenLibrary={() => navigate("/app/library")}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 glass-md border-b border-[var(--color-border)] safe-top">
          {/* Mobile menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Center: persona info */}
          <div className="flex items-center gap-2.5 mx-auto lg:mx-0">
            {activePersona ? (
              <>
                <Avatar
                  src={activePersona.avatar}
                  name={activePersona.name}
                  gradient={activePersona.avatarGradient}
                  size="sm"
                  animated={false}
                />
                <div>
                  <p className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-none">
                    {activePersona.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
                      Available
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/app/library")}
                className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors text-[14px]"
              >
                <img src="/1.png" alt="Persona Logo" className="w-8 h-8 object-contain" />
                Choose a Persona
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Info toggle */}
          {activePersona && (
            <button
              onClick={togglePersonaInfo}
              aria-label={personaInfoOpen ? "Hide persona info" : "Show persona info"}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)]",
                "transition-colors duration-150",
                personaInfoOpen
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]"
              )}
            >
              <Info size={18} />
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
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
