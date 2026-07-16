// Signup page

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { Input, PasswordStrength } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../components/ui/Toast";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
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

export default function Signup() {
  const navigate = useNavigate();
  const { signup, googleLogin, isLoading } = useAuthStore();
  const { addToast } = useToast();
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      await signup({ name: data.name, email: data.email, password: data.password });
      addToast({ message: "Account created! Welcome to Persona.", type: "success" });
      navigate("/app/library");
    } catch (err) {
      setError("email", { message: err.message });
    }
  };

  const handleGoogle = async () => {
    try {
      await googleLogin();
      addToast({ message: "Signed up with Google", type: "success" });
      navigate("/app/library");
    } catch (err) {
      addToast({ message: err.message, type: "error" });
    }
  };

  return (
    <GlassPanel intensity="strong" rounded="xl" className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-[var(--color-text-primary)] text-2xl font-bold">
            Create your account
          </h2>
          <p className="text-[var(--color-text-secondary)] text-[14px] mt-1">
            Join Persona — free to start, no credit card required
          </p>
        </div>

        {/* Google OAuth */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-[14px] font-medium transition-all duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] disabled:opacity-50"
          aria-label="Continue with Google"
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-[12px] text-[var(--color-text-tertiary)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="signup-name"
            label="Full name"
            type="text"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="signup-email"
            label="Email address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <div>
            <Input
              id="signup-password"
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrength password={password} />
          </div>
          <Input
            id="signup-confirm"
            label="Confirm password"
            type="password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
          >
            <UserPlus size={16} />
            Create Account
          </Button>
        </form>

        <p className="text-center text-[13px] text-[var(--color-text-tertiary)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-glow)] font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
          By creating an account, you agree to our{" "}
          <a href="#" className="underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </GlassPanel>
  );
}
