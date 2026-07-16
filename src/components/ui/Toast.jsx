// Toast — notification system via React context + portal

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);

let toastId = 0;

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle size={18} className="text-[var(--color-destructive)] flex-shrink-0" />,
  info: <Info size={18} className="text-[var(--color-accent)] flex-shrink-0" />,
};

function ToastItem({ toast, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={clsx(
        "glass-strong rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]",
        "flex items-start gap-3 px-4 py-3.5 min-w-[280px] max-w-[360px]",
        "border border-[var(--color-border)]"
      )}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type] || icons.info}
      <p className="flex-1 text-[14px] text-[var(--color-text-primary)] leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = "info", duration = 4000 }) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type }]);
      timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        >
          <AnimatePresence>
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <ToastItem toast={toast} onDismiss={dismiss} />
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default ToastProvider;
