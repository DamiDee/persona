// Onboarding — 4-slide swipeable intro with Framer Motion

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { NeuralBackground } from "../../components/chat/NeuralBackground";
import { mockPersonas } from "../../data/mockPersonas";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const slides = [
  {
    id: 1,
    label: "Welcome",
    headline: "Talk to the minds\nthat shaped you.",
    sub: "Persona brings you into conversation with the voices that have defined leadership, faith, literature, and culture.",
    visual: "hero",
  },
  {
    id: 2,
    label: "Grounded",
    headline: "Every conversation,\ngrounded in their real words.",
    sub: "Each Persona is built from a curated corpus of sermons, books, lectures, and interviews — not a generic AI.",
    visual: "books",
  },
  {
    id: 3,
    label: "Choose",
    headline: "Choose who you'd\nlike to speak with.",
    sub: "Four distinct voices to start. Each with a unique perspective, tone, and depth.",
    visual: "personas",
  },
  {
    id: 4,
    label: "Start",
    headline: "Your next great\nconversation awaits.",
    sub: "Sign up free — no credit card required. Premium voices available for subscribers.",
    visual: "cta",
  },
];

function HeroVisual({ reduced }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={reduced ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.12, 0.04, 0.12],
          }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}
          className="absolute inset-0 rounded-full border border-[var(--color-accent)]"
          style={{ margin: `${i * 20}px` }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center bg-white border border-[var(--color-border)] shadow-lg"
          style={{ boxShadow: "0 0 40px rgba(0,194,209,0.2)" }}
        >
          <img
            src="/1.png"
            alt="Persona Brand Logo"
            className="w-22 h-22 object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function BooksVisual() {
  const items = ["12 Sermons", "3 Books", "8 Lectures", "20 Interviews"];
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.2 }}
          className="glass rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-medium text-[var(--color-accent)] border border-[var(--color-accent)]/20"
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function PersonasVisual() {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {mockPersonas.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 + 0.1 }}
          className="flex flex-col items-center gap-2"
        >
          <Avatar
            name={p.name}
            gradient={p.avatarGradient}
            size="lg"
            animated
          />
          <span className="text-[12px] text-[var(--color-text-secondary)] font-medium text-center max-w-[80px] leading-tight">
            {p.name.split(" ")[0]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function CTAVisual() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl"
      style={{
        background: "linear-gradient(135deg, rgba(0,194,209,0.2), rgba(0,229,255,0.05))",
        border: "2px solid rgba(0,194,209,0.4)",
        boxShadow: "0 0 40px rgba(0,194,209,0.15)",
      }}
    >
      ✦
    </motion.div>
  );
}

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => {
    if (current < slides.length - 1) goTo(current + 1);
  };

  const prev = () => {
    if (current > 0) goTo(current - 1);
  };

  const slide = slides[current];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: reduced ? 0 : dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: reduced ? 0 : dir * -40 }),
  };

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden bg-[var(--color-bg-base)]">
      <NeuralBackground opacity={0.06} />

      {/* Skip button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => navigate("/login")}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] text-[13px] transition-colors"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 max-w-lg text-center"
          >
            {/* Visual */}
            <div className="h-48 flex items-center justify-center w-full">
              {slide.visual === "hero" && <HeroVisual reduced={reduced} />}
              {slide.visual === "books" && <BooksVisual />}
              {slide.visual === "personas" && <PersonasVisual />}
              {slide.visual === "cta" && <CTAVisual />}
            </div>

            {/* Text */}
            <div className="space-y-4">
              <h1
                className="text-[var(--color-text-primary)] font-bold leading-tight"
                style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}
              >
                {slide.headline.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < slide.headline.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[17px] leading-relaxed">
                {slide.sub}
              </p>
            </div>

            {/* CTA slide actions */}
            {current === slides.length - 1 && (
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  I already have an account
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-12 relative z-10">
        {/* Prev */}
        <button
          onClick={prev}
          disabled={current === 0}
          aria-label="Previous slide"
          className="w-10 h-10 flex items-center justify-center rounded-full glass text-[var(--color-text-tertiary)] disabled:opacity-0 disabled:pointer-events-none hover:text-[var(--color-accent)] transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2" role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
            >
              <motion.div
                animate={{
                  width: i === current ? 24 : 8,
                  backgroundColor:
                    i === current
                      ? "var(--color-accent)"
                      : "var(--color-border-strong)",
                }}
                transition={{ duration: 0.25 }}
                className="h-2 rounded-full"
                style={{ width: 8 }}
              />
            </button>
          ))}
        </div>

        {/* Next */}
        {current < slides.length - 1 ? (
          <button
            onClick={next}
            aria-label="Next slide"
            className="w-10 h-10 flex items-center justify-center rounded-full glass text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
          >
            <ArrowRight size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
}
