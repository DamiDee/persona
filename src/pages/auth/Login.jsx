// Login.jsx — Compact, high-contrast dark login form

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { LogIn, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
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
    <div className="p-8 rounded-3xl bg-[#0c0e12] border border-white/10 shadow-2xl space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold tracking-tight">
          Welcome back
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Sign in to continue your conversations with remarkable minds
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-[11px] text-zinc-500 font-mono">OR</span>
        <div className="flex-1 h-px bg-zinc-800" />
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
            className="text-xs text-cyan-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        Don't have an account?{" "}
        <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
