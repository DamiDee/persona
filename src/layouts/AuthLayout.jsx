// AuthLayout — centered glass card floating over neural-mesh backdrop

import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeuralBackground } from "../components/chat/NeuralBackground";
import { useAuthStore } from "../store/useAuthStore";

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Redirect authenticated users to the app
  if (isAuthenticated) {
    return <Navigate to="/app/library" replace />;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center relative p-4 overflow-hidden">
      {/* Faint neural background */}
      <NeuralBackground opacity={0.05} />

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(circle, rgba(0,194,209,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 80, -60, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(circle, rgba(170,59,255,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Wordmark */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/1.png" alt="Persona Logo" className="w-28 h-28 object-contain" />
          <p className="text-[var(--color-accent)] text-[13px] font-medium tracking-[0.08em] uppercase mt-0.5">
            Conversations with minds that shaped you
          </p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
}

export default AuthLayout;
