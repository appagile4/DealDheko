"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@dealdheko.com");
  const [password, setPassword] = useState("Admin@DealDheko2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/admin/login", {
        email: email.trim(),
        password,
      });

      if (response.data.success && response.data.token) {
        // Persist admin session
        if (typeof window !== "undefined") {
          localStorage.setItem("dealdoko_token", response.data.token);
          localStorage.setItem("dealdoko_admin_user", JSON.stringify(response.data.user));
          localStorage.setItem("deal_dheko_user", JSON.stringify(response.data.user));
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 500);
      } else {
        setError(response.data.message || "Failed to authenticate.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid administrator credentials or access denied."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setEmail("admin@dealdheko.com");
    setPassword("Admin@DealDheko2026!");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#080C15] text-slate-100 relative overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-[#00A896]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Standalone Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0047BA] to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-tight">DealDoko</span>
              <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Superadmin
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Internal Administration &amp; Moderation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Atlas Cluster Live</span>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
          >
            <span>Public Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Central Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#0047BA] to-blue-500 text-white shadow-xl shadow-blue-500/20 mb-1">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              Superadmin Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Authorized administrative access for DealDoko classified marketplace moderation &amp; control.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authentication verified! Entering dashboard...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dealdheko.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Default Credentials Notice */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Default Root Account:</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillCredentials}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-300">
                admin@dealdheko.com / Admin@DealDheko2026!
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0047BA] to-blue-600 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Superadmin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Return to DealDoko Public Marketplace
            </Link>
          </div>
        </div>
      </main>

      {/* Standalone Bottom Footer Bar */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-500">
        <span>DealDoko Marketplace Administration Engine • Secured with Role-Based Access Control (RBAC)</span>
      </footer>
    </div>
  );
}
