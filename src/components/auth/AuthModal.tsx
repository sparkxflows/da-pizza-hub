"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Mail, KeyRound, User, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setCustomer, fetchAddresses } = useCustomerStore();
  
  const [tab, setTab] = useState<"phone" | "supabase">(authModalTab || "phone");
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  
  // Phone Form State
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Supabase Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await fetch("/api/customer/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: cleanPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setDevOtp(data.devOtp || "1234");
        setPhoneStep("otp");
      } else {
        setPhoneError(data.message || "Failed to send OTP.");
      }
    } catch {
      setPhoneError("Network error. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError(null);
    if (!otp.trim()) {
      setPhoneError("Please enter the 4-digit OTP.");
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await fetch("/api/customer/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          phone: phone.replace(/\D/g, "").slice(-10),
          code: otp.trim(),
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        fetchAddresses();
        setSuccessMsg("Welcome to Da Pizza Hub!");
        setTimeout(() => {
          closeAuthModal();
          setSuccessMsg(null);
          setPhoneStep("input");
          setOtp("");
        }, 1200);
      } else {
        setPhoneError(data.message || "Invalid OTP code.");
      }
    } catch {
      setPhoneError("Failed to verify OTP.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handleSupabaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSupabaseError(null);
    if (!email.includes("@")) {
      setSupabaseError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setSupabaseError("Password must be at least 6 characters.");
      return;
    }

    setSupabaseLoading(true);
    try {
      const res = await fetch("/api/customer/auth/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isSignUp ? "signup" : "signin",
          email,
          password,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        fetchAddresses();
        setSuccessMsg(isSignUp ? "Account created successfully!" : "Signed in successfully!");
        setTimeout(() => {
          closeAuthModal();
          setSuccessMsg(null);
        }, 1200);
      } else {
        setSupabaseError(data.message || "Authentication failed.");
      }
    } catch {
      setSupabaseError("Network error. Please try again.");
    } finally {
      setSupabaseLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

          {/* Success Notification */}
          {successMsg ? (
            <div className="py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
              >
                <CheckCircle2 size={36} />
              </motion.div>
              <h3 className="font-heading text-2xl text-white">{successMsg}</h3>
              <p className="mt-2 text-sm text-ink-secondary">Logging you into your account...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#F6C453] uppercase">
                  Da Pizza Hub • Hansi
                </span>
                <h3 className="mt-1 font-heading text-2xl sm:text-3xl font-semibold text-white">
                  Customer Sign In
                </h3>
                <p className="mt-1 text-xs text-ink-secondary">
                  Access saved addresses, past bills &amp; 1-click reorder
                </p>
              </div>

              {/* Tabs: Phone vs Supabase */}
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/5 p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setTab("phone");
                    setPhoneError(null);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                    tab === "phone"
                      ? "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Smartphone size={15} />
                  Phone (OTP)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("supabase");
                    setSupabaseError(null);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                    tab === "supabase"
                      ? "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <KeyRound size={15} />
                  Supabase (Email)
                </button>
              </div>

              {/* TAB 1: PHONE OTP */}
              {tab === "phone" && (
                <div>
                  {phoneStep === "input" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Your Name (Optional)
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none focus:ring-1 focus:ring-[#D91F26]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Mobile Number <span className="text-[#D91F26]">*</span>
                        </label>
                        <div className="relative flex rounded-2xl border border-white/10 bg-white/5 focus-within:border-[#D91F26] focus-within:ring-1 focus-within:ring-[#D91F26]">
                          <span className="flex items-center pl-3.5 pr-2 text-sm font-semibold text-[#F6C453]">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="99112 73199"
                            required
                            className="w-full bg-transparent pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                          />
                        </div>
                      </div>

                      {phoneError && (
                        <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                          {phoneError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={phoneLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#D91F26]/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {phoneLoading ? "Sending OTP..." : "Get OTP Verification Code"}
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-white/60">OTP sent to:</span>{" "}
                          <span className="font-semibold text-white">+91 {phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhoneStep("input")}
                          className="text-[#F6C453] hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      {devOtp && (
                        <div className="rounded-xl bg-[#F6C453]/10 border border-[#F6C453]/20 px-3 py-2 text-center text-xs text-[#F6C453]">
                          ✨ Demo OTP: <strong className="font-mono text-sm tracking-wider">{devOtp}</strong> (or use <strong>1234</strong>)
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5 text-center">
                          Enter 4-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          autoFocus
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="• • • •"
                          className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-2xl border border-white/10 bg-white/5 py-3 text-white placeholder:text-white/20 focus:border-[#D91F26] focus:outline-none focus:ring-1 focus:ring-[#D91F26]"
                        />
                      </div>

                      {phoneError && (
                        <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 text-center">
                          {phoneError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={phoneLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#D91F26]/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {phoneLoading ? "Verifying..." : "Verify & Sign In"}
                        <ShieldCheck size={16} />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: SUPABASE AUTH */}
              {tab === "supabase" && (
                <form onSubmit={handleSupabaseSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Email Address <span className="text-[#D91F26]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Password (min 6 characters) <span className="text-[#D91F26]">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none"
                      />
                    </div>
                  </div>

                  {supabaseError && (
                    <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                      {supabaseError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={supabaseLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#D91F26]/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {supabaseLoading
                      ? "Connecting Supabase..."
                      : isSignUp
                      ? "Create Supabase Account"
                      : "Sign In with Supabase"}
                    <ArrowRight size={16} />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setSupabaseError(null);
                      }}
                      className="text-xs text-ink-secondary hover:text-white transition"
                    >
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "New to Da Pizza Hub? Create an Account"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
