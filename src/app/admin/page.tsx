"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@dealdheko.com");
  const [password, setPassword] = useState("Admin@DealDheko2026!");
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
        }, 600);
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl my-6">
      <div className="max-w-md w-full space-y-8 bg-slate-800/90 p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-[#0047BA] to-blue-500 text-white shadow-lg shadow-blue-500/20 mb-1">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Superadmin Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Authorized administrative access for DealDoko marketplace moderation &amp; control.
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
            <span>Authenticated! Redirecting to Superadmin Dashboard...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Master Password
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Default Credentials Notice */}
          <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Default Root Credentials Pre-filled:</span>
            </div>
            <div className="font-mono text-[10px] text-slate-300">
              admin@dealdheko.com / Admin@DealDheko2026!
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#0047BA] to-blue-600 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Database...</span>
              </>
            ) : (
              <>
                <span>Enter Superadmin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Marketplace */}
        <div className="pt-2 text-center border-t border-slate-700/60">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to DealDoko Public Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
