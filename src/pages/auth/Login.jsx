// Login.jsx — Compact, high-contrast dark login form

import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../components/ui/Toast";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading } = useAuthStore();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password });
      addToast({ title: "Welcome back!", description: "Signed in successfully", type: "success" });
      navigate("/app/library");
    } catch (err) {
      setError("password", { message: err.message });
    }
  };

  const handleGoogle = async () => {
    try {
      await googleLogin();
      addToast({ title: "Signed in with Google", type: "success" });
      navigate("/app/library");
    } catch (err) {
      addToast({ title: err.message, type: "error" });
    }
  };

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[30px] bg-[var(--color-glass-strong)] backdrop-blur-2xl border border-[var(--color-border-strong)] shadow-[0_24px_80px_rgba(15,23,42,0.12)] space-y-6">
      <div className="absolute -right-20 -top-24 w-52 h-52 rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-3xl pointer-events-none" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-accent)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          Welcome back
        </span>
        <h2 className="mt-3 text-[var(--color-text-primary)] text-3xl sm:text-[34px] leading-tight font-extrabold tracking-[-0.035em]">
          Continue your conversations.
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-2 leading-relaxed">
          Sign in to return to your saved minds, sources, and insights.
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading}
        className="relative w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold tracking-[0.14em]">OR EMAIL</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="login-email"
          label="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-glow)]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full py-3.5 px-4 rounded-2xl bg-[var(--color-text-primary)] hover:opacity-90 text-[var(--color-bg-base)] font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--color-accent)] hover:text-[var(--color-accent-glow)] font-semibold">
          Sign up free
        </Link>
      </p>

      <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
        <ShieldCheck size={12} className="text-emerald-500" />
        Private workspace · Secure sign in
      </div>
    </div>
  );
}
