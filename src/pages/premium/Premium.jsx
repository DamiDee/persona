// Premium / Upgrade page with mock checkout flow

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Lock, Zap, Infinity, Users, Mic, Star } from "lucide-react";
import clsx from "clsx";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../components/ui/Toast";
import { paymentApi } from "../../lib/mockApi";

const FREE_FEATURES = [
  "2 free Personas (Joshua Selman, Femi Lazarus)",
  "100 messages per month",
  "Standard response speed",
  "Basic conversation history",
];

const PREMIUM_FEATURES = [
  "All 4 Personas — including premium voices",
  "Unlimited messages",
  "Priority response speed",
  "Voice mode (coming soon)",
  "Full conversation history & export",
  "Early access to new Personas",
];

function CheckItem({ text, included }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={clsx(
          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          included
            ? "bg-[var(--color-accent)] text-[var(--color-button-text)]"
            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
        )}
      >
        {included ? <Check size={11} strokeWidth={2.5} /> : <span className="text-[10px]">–</span>}
      </div>
      <span
        className={clsx(
          "text-[14px] leading-snug",
          included ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
        )}
      >
        {text}
      </span>
    </div>
  );
}

function CheckoutForm({ plan, billing, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const price = billing === "annual" ? 9.6 : 12;
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // MOCK — no real payment processor integrated.
      await paymentApi.processCheckout({ plan, billing, cardDetails: {} });
      onSuccess();
    } catch (err) {
      setError(err.message);
      addToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassPanel intensity="strong" rounded="xl" className="p-8 max-w-md mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-[var(--color-text-primary)] text-xl font-bold">
              Complete your upgrade
            </h2>
            <p className="text-[var(--color-text-secondary)] text-[14px] mt-1">
              Persona Premium · {billing === "annual" ? "Annual" : "Monthly"} · ${price.toFixed(2)}/mo
            </p>
          </div>

          {/* Demo notice */}
          <div className="glass rounded-[var(--radius-md)] p-3 border border-[var(--color-accent)]/20">
            <p className="text-[var(--color-accent)] text-[12px]">
              {/* MOCK — no real payment processor integrated */}
              🔒 Demo mode — enter any details below. No real payment will be processed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="card-name" label="Name on card" type="text" defaultValue="Alex Morgan" />
            <Input id="card-number" label="Card number" type="text" defaultValue="4242 4242 4242 4242" hint="Demo: any number works" />
            <div className="grid grid-cols-2 gap-3">
              <Input id="card-expiry" label="MM / YY" type="text" defaultValue="12/28" />
              <Input id="card-cvc" label="CVC" type="text" defaultValue="123" />
            </div>

            {error && (
              <p className="text-[var(--color-destructive)] text-[13px]">{error}</p>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              <Lock size={15} />
              Pay ${price.toFixed(2)}/mo
            </Button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Back to plans
            </button>
          </form>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function SuccessScreen() {
  const { upgradeToPremium } = useAuthStore();

  useState(() => {
    upgradeToPremium();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-col items-center gap-8 text-center max-w-sm mx-auto py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-[var(--color-accent)] flex items-center justify-center"
        style={{ boxShadow: "0 0 60px rgba(0,194,209,0.4)" }}
      >
        <Check size={40} strokeWidth={2.5} className="text-[var(--color-button-text)]" />
      </motion.div>

      <div>
        <h2 className="text-[var(--color-text-primary)] text-2xl font-bold mb-2">
          Welcome to Premium! ✦
        </h2>
        <p className="text-[var(--color-text-secondary)] text-[16px] leading-relaxed">
          You now have access to all Personas, unlimited messages, and priority responses.
        </p>
      </div>

      <Button variant="primary" size="lg" onClick={() => window.location.href = "/app/library"}>
        <Zap size={16} />
        Explore All Personas
      </Button>
    </motion.div>
  );
}

export default function Premium() {
  const [billing, setBilling] = useState("monthly"); // "monthly" | "annual"
  const [step, setStep] = useState("plans"); // "plans" | "checkout" | "success"
  const { user } = useAuthStore();

  const monthlyPrice = 12;
  const annualPrice = 9.6;

  if (user?.plan === "premium" && step !== "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
        <Star size={48} className="text-[var(--color-accent)]" />
        <h1 className="text-[var(--color-text-primary)] text-2xl font-bold">
          You're already on Premium ✦
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Enjoy unlimited access to all Personas and features.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-10 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {step === "plans" && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-10"
          >
            <div className="text-center space-y-3">
              <h1 className="text-[var(--color-text-primary)] text-3xl font-bold tracking-tight">
                Unlock the full Persona experience
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[17px]">
                Go deeper with all Personas, unlimited messages, and priority access.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBilling("monthly")}
                className={clsx(
                  "text-[14px] font-medium transition-colors",
                  billing === "monthly"
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)]"
                )}
              >
                Monthly
              </button>

              <div
                className="relative w-12 h-6 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] cursor-pointer"
                onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
                role="switch"
                aria-checked={billing === "annual"}
                aria-label="Toggle annual billing"
              >
                <motion.div
                  animate={{ x: billing === "annual" ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBilling("annual")}
                  className={clsx(
                    "text-[14px] font-medium transition-colors",
                    billing === "annual"
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)]"
                  )}
                >
                  Annual
                </button>
                <Badge variant="premium">Save 20%</Badge>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free */}
              <GlassPanel intensity="md" rounded="xl" className="p-8 space-y-6">
                <div>
                  <p className="text-caption">Free</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-[var(--color-text-primary)]">$0</span>
                    <span className="text-[var(--color-text-secondary)] text-[14px]">/mo</span>
                  </div>
                  <p className="text-[var(--color-text-tertiary)] text-[13px] mt-1">
                    No credit card required
                  </p>
                </div>

                <div className="space-y-3">
                  {FREE_FEATURES.map((f) => <CheckItem key={f} text={f} included />)}
                </div>

                <Button variant="secondary" size="md" fullWidth onClick={() => window.location.href = "/app/library"}>
                  Current Plan
                </Button>
              </GlassPanel>

              {/* Premium */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="active">Most Popular</Badge>
                </div>
                <GlassPanel
                  intensity="strong"
                  rounded="xl"
                  className="p-8 space-y-6"
                  style={{
                    border: "1px solid rgba(0,194,209,0.35)",
                    boxShadow: "0 0 40px rgba(0,194,209,0.12)",
                  }}
                >
                  <div>
                    <p className="text-caption text-[var(--color-accent)]">Premium</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <motion.span
                        key={billing}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-[var(--color-text-primary)]"
                      >
                        ${billing === "annual" ? annualPrice.toFixed(2) : monthlyPrice}
                      </motion.span>
                      <span className="text-[var(--color-text-secondary)] text-[14px]">/mo</span>
                    </div>
                    {billing === "annual" && (
                      <p className="text-[var(--color-text-tertiary)] text-[13px] mt-1">
                        Billed ${(annualPrice * 12).toFixed(2)} annually
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {PREMIUM_FEATURES.map((f) => <CheckItem key={f} text={f} included />)}
                  </div>

                  <Button variant="primary" size="md" fullWidth onClick={() => setStep("checkout")}>
                    <Zap size={15} />
                    Upgrade to Premium
                  </Button>
                </GlassPanel>
              </div>
            </div>
          </motion.div>
        )}

        {step === "checkout" && (
          <motion.div key="checkout" className="flex justify-center">
            <div className="w-full max-w-md">
              <CheckoutForm
                plan="premium"
                billing={billing}
                onSuccess={() => setStep("success")}
                onCancel={() => setStep("plans")}
              />
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success">
            <SuccessScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
