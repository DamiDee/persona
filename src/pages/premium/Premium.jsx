// Premium.jsx — Upgrade page with dark charcoal pricing cards & mock checkout flow

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";
import clsx from "clsx";
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
  "All Personas — including PRO catalog",
  "Unlimited conversation history & streaming",
  "Priority response latency",
  "Audio & Notion source sync",
  "Early access to new trained minds",
];

function CheckItem({ text, included }) {
  return (
    <div className="flex items-start gap-3 text-xs sm:text-sm">
      <div
        className={clsx(
          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          included
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            : "bg-zinc-800 text-zinc-600"
        )}
      >
        {included ? <Check size={10} strokeWidth={3} /> : <span className="text-[10px]">–</span>}
      </div>
      <span className={included ? "text-zinc-200" : "text-zinc-500"}>{text}</span>
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
      await paymentApi.processCheckout({ plan, billing, cardDetails: {} });
      onSuccess();
    } catch (err) {
      setError(err.message);
      addToast({ title: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="p-8 rounded-3xl bg-[#0c0e12] border border-amber-500/30 max-w-md mx-auto shadow-2xl space-y-6 text-white"
    >
      <div>
        <h2 className="text-xl font-bold">Complete Upgrade</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Persona PRO • {billing === "annual" ? "Annual" : "Monthly"} • ${price.toFixed(2)}/mo
        </p>
      </div>

      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        🔒 Demo Checkout Mode — enter any details below to activate PRO instantly.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="card-name" label="Name on card" type="text" defaultValue="Alex Morgan" />
        <Input id="card-number" label="Card number" type="text" defaultValue="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-3">
          <Input id="card-expiry" label="MM / YY" type="text" defaultValue="12/28" />
          <Input id="card-cvc" label="CVC" type="text" defaultValue="123" />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <Lock size={14} />
          <span>Pay ${price.toFixed(2)}/mo</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Back to plans
        </button>
      </form>
    </motion.div>
  );
}

function SuccessScreen() {
  const { upgradeToPremium } = useAuthStore();

  useState(() => {
    upgradeToPremium();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto py-12 text-white">
      <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
        <Sparkles size={36} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Welcome to PRO ✦</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          You now have unlimited access to all personas, source materials, and features.
        </p>
      </div>
      <button
        onClick={() => (window.location.href = "/app/library")}
        className="px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
      >
        <span>Explore All Personas</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function Premium() {
  const [billing, setBilling] = useState("monthly");
  const [step, setStep] = useState("plans");
  const { user } = useAuthStore();

  const monthlyPrice = 12;
  const annualPrice = 9.6;

  if (user?.plan === "premium" && step !== "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4 text-white">
        <Crown size={44} className="text-amber-400 animate-pulse" />
        <h1 className="text-2xl font-bold">You are on Persona PRO ✦</h1>
        <p className="text-zinc-400 text-sm max-w-md">
          Enjoy unlimited access to all certified persona models and knowledge bases.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-10 max-w-5xl mx-auto text-white">
      <AnimatePresence mode="wait">
        {step === "plans" && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-10"
          >
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
                <Crown size={14} /> Upgrade Plan
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Unlock the full Persona catalog
              </h1>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                Go deeper with all certified minds, unlimited streaming, and source material sync.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBilling("monthly")}
                className={clsx(
                  "text-xs font-semibold cursor-pointer transition-colors",
                  billing === "monthly" ? "text-white" : "text-zinc-500"
                )}
              >
                Monthly
              </button>
              <div
                onClick={() => setBilling((b) => (b === "monthly" ? "annual" : "monthly"))}
                className="w-12 h-6 rounded-full bg-zinc-800 border border-zinc-700 p-0.5 cursor-pointer relative"
              >
                <div
                  className={clsx(
                    "w-4 h-4 rounded-full bg-amber-400 transition-transform",
                    billing === "annual" ? "translate-x-6" : "translate-x-0.5"
                  )}
                />
              </div>
              <button
                onClick={() => setBilling("annual")}
                className={clsx(
                  "text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5",
                  billing === "annual" ? "text-white" : "text-zinc-500"
                )}
              >
                <span>Annual</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30 font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Card */}
              <div className="p-8 rounded-3xl bg-[#0c0e12] border border-white/10 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-zinc-500">Free Tier</span>
                    <div className="text-3xl font-bold mt-1">$0</div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {FREE_FEATURES.map((f) => (
                      <CheckItem key={f} text={f} included />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "/app/library")}
                  className="w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  Current Plan
                </button>
              </div>

              {/* PRO Card */}
              <div className="p-8 rounded-3xl bg-[#0d0f14] border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.12)] space-y-6 flex flex-col justify-between relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-amber-400">Persona PRO</span>
                    <div className="text-3xl font-bold mt-1 text-white">
                      ${billing === "annual" ? annualPrice.toFixed(2) : monthlyPrice}{" "}
                      <span className="text-xs text-zinc-500 font-normal">/mo</span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {PREMIUM_FEATURES.map((f) => (
                      <CheckItem key={f} text={f} included />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown size={14} />
                  <span>Upgrade to PRO</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "checkout" && (
          <CheckoutForm
            plan="premium"
            billing={billing}
            onSuccess={() => setStep("success")}
            onCancel={() => setStep("plans")}
          />
        )}

        {step === "success" && <SuccessScreen />}
      </AnimatePresence>
    </div>
  );
}
