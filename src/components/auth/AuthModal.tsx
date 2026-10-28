"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
} from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import { supabase } from "@/lib/supabase-client";

function GoogleSvg() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    setCustomer,
    fetchAddresses,
  } = useCustomerStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/customer/auth/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isSignUp ? "signup" : "signin",
          name: isSignUp ? name.trim() : undefined,
          phone: isSignUp ? phone.trim() : undefined,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || "Authentication failed.");
        return;
      }

      setCustomer(data.customer);
      fetchAddresses();
      setSuccessMsg(
        isSignUp
          ? "Account created successfully!"
          : `Welcome back, ${data.customer.name}!`
      );
      setTimeout(() => {
        closeAuthModal();
        setSuccessMsg(null);
      }, 1200);
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F6C453]">
            DA PIZZA HUB ACCOUNT
          </span>
          <h2 className="mt-1 font-heading text-2xl font-bold text-white">
            {isSignUp ? "Create Your Account" : "Sign In to Da Pizza Hub"}
          </h2>
          <p className="mt-1 text-xs text-white/50">
            {isSignUp
              ? "Join us to save addresses and track live orders."
              : "Sign in with Google or your email & password."}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 rounded-2xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-400">
            {authError}
          </div>
        )}

        {/* 1. Supabase Continue with Google (One-Click) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold text-white transition hover:bg-white/10 hover:border-white/30 disabled:opacity-50"
        >
          <GoogleSvg />
          <span>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#121212] px-3 text-white/40 tracking-wider font-semibold">
              or with email &amp; password
            </span>
          </div>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white placeholder:text-white/25 focus:border-[#D91F26] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white placeholder:text-white/25 focus:border-[#D91F26] outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-white/70 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white placeholder:text-white/25 focus:border-[#D91F26] outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/70 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white placeholder:text-white/25 focus:border-[#D91F26] outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-xs font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <span>
              {loading
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError(null);
            }}
            className="text-xs text-white/60 hover:text-white transition"
          >
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <span className="font-bold text-[#F6C453] underline ml-1">
                  Sign In
                </span>
              </>
            ) : (
              <>
                New customer?{" "}
                <span className="font-bold text-[#F6C453] underline ml-1">
                  Create an Account
                </span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
