// 404 / Not Found page

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "../components/ui/Button";
import { NeuralBackground } from "../components/chat/NeuralBackground";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex items-center justify-center relative overflow-hidden">
      <NeuralBackground opacity={0.04} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center gap-8 text-center px-8"
      >
        {/* Glowing number */}
        <div className="relative">
          <p
            className="text-[150px] font-bold leading-none select-none"
            style={{
              color: "var(--color-accent)",
              opacity: 0.08,
              letterSpacing: "-0.04em",
            }}
            aria-hidden="true"
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-accent), #0e7490)",
                boxShadow: "0 0 40px rgba(0,194,209,0.3)",
              }}
            >
              ?
            </div>
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <h1 className="text-[var(--color-text-primary)] text-3xl font-bold">
            Page not found
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[17px] leading-relaxed">
            The page you're looking for has drifted off into the neural network.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/")}
        >
          <Home size={16} />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
