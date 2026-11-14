"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  ShieldCheck,
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#F0F6FF] via-[#F8FAFC] to-[#FFF4EB]/40 text-slate-900 relative select-none">
      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center hover:opacity-95 transition-opacity">
            <Image
              src="/dealdoko-logo.png"
              alt="DealDoko"
              width={160}
              height={55}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <span className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#0047BA] text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0047BA]" />
            <span>Superadmin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MongoDB Atlas Cluster Live</span>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-[#0047BA] flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <span>Public Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Brand Logo & Title */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <Image
                src="/dealdoko-logo.png"
                alt="DealDoko Logo"
                width={200}
                height={68}
                priority
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200/60 text-[#0047BA] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Administrative Access</span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Superadmin Sign In
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your master credentials to manage advertisement approvals and user controls.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentication verified! Opening dashboard...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4 text-[#0047BA]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dealdheko.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0047BA] focus:ring-2 focus:ring-[#0047BA]/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4 text-[#FF6A00]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0047BA] focus:ring-2 focus:ring-[#0047BA]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Autofill / Pre-filled Box */}
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-orange-50/60 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#0047BA] font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Default Root Account:</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillCredentials}
                  className="text-[10px] text-[#0047BA] hover:text-[#FF6A00] font-bold underline cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-800">
                admin@dealdheko.com / Admin@DealDheko2026!
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 px-4 bg-[#0047BA] hover:bg-[#00338D] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#0047BA]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

          {/* Return Link */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[#0047BA] transition-colors"
            >
              ← Return to DealDoko Public Marketplace
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full px-6 py-3 bg-white/60 border-t border-slate-200/80 text-center text-xs text-slate-500">
        <span>DealDoko Marketplace Administration • Secured with Role-Based Access Control (RBAC)</span>
      </footer>
    </div>
  );
}
