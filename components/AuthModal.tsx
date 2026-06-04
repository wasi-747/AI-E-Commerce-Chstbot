"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab]             = useState<"signin" | "register">(defaultTab);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setConfirm("");
    setError(null); setSuccess(null); setLoading(false); setShowPw(false);
  };

  const switchTab = (t: "signin" | "register") => { reset(); setTab(t); };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
    } else {
      onClose();
      reset();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !confirm) { setError("All fields are required."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      // Auto sign-in after successful registration
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signInRes?.error) { setError("Account created but sign-in failed. Please sign in manually."); switchTab("signin"); }
      else { onClose(); reset(); }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tab === "signin" ? "Sign in to your account" : "Create a new account"}
        className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl z-10"
      >
        {/* Close button */}
        <button
          onClick={() => { onClose(); reset(); }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={16} strokeWidth={1.5} className="text-slate-600" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 mb-1">TechDojo Store</p>
          <h2 className="text-xl font-light text-slate-900 tracking-tight">
            {tab === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
          {(["signin", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-3.5 text-[10px] uppercase tracking-widest font-medium transition-colors ${
                tab === t
                  ? "text-slate-900 border-b-2 border-slate-900 -mb-px"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {t === "signin" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={tab === "signin" ? handleSignIn : handleRegister}
          className="px-8 py-6 space-y-4"
        >
          {tab === "register" && (
            <div>
              <label htmlFor="auth-name" className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPw ? "text" : "password"}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Min. 8 characters" : "Your password"}
                className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {tab === "register" && (
            <div>
              <label htmlFor="auth-confirm" className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
                Confirm Password
              </label>
              <input
                id="auth-confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <p role="alert" className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-3 py-2">
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[11px] uppercase tracking-[0.25em] py-4 hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading
              ? (tab === "signin" ? "Signing in..." : "Creating account...")
              : (tab === "signin" ? "Sign In" : "Create Account")}
          </button>
        </form>

        {/* Footer toggle */}
        <div className="px-8 pb-8 text-center">
          <p className="text-[10px] text-slate-400">
            {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchTab(tab === "signin" ? "register" : "signin")}
              className="text-slate-900 underline underline-offset-2 hover:text-slate-600 transition-colors"
            >
              {tab === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
