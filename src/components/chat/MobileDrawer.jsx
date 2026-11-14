// MobileDrawer — slide-in sidebar overlay for mobile/tablet

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileDrawer({ isOpen, onClose, onOpenLibrary }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-hidden shadow-2xl"
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute top-3.5 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex flex-col h-full">
              <Sidebar
                mobile
                collapsed={false}
                onToggleCollapse={onClose}
                onOpenLibrary={() => {
                  onClose();
                  onOpenLibrary?.();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;
