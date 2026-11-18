"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, AlertCircle } from "lucide-react";
import { GoogleAuthButton } from "./GoogleAuthButton";

interface AuthMethodSelectorProps {
  onSelectEmail: () => void;
  onSelectPhone: () => void;
  onGoogleSuccess: () => void;
  onGoogleError: (err: string) => void;
  errorMessage?: string | null;
}

export const AuthMethodSelector: React.FC<AuthMethodSelectorProps> = ({
  onSelectEmail,
  onSelectPhone,
  onGoogleSuccess,
  onGoogleError,
  errorMessage,
}) => {
  return (
    <div className="flex flex-col text-slate-800">
      {/* Brand & Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <span className="text-2xl font-black tracking-tight text-[#00225E]">
            Deal<span className="text-[#FF6A00]">Doko</span>
            <span className="text-xs font-semibold text-slate-400">.com</span>
          </span>
        </div>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose how you want to continue.
        </p>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Auth Actions */}
      <div className="space-y-3">
        {/* 1. Continue with Google */}
        <GoogleAuthButton onSuccess={onGoogleSuccess} onError={onGoogleError} />

        {/* 2. Continue with Email */}
        <button
          type="button"
          onClick={onSelectEmail}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0047BA] hover:bg-[#003893] text-white font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-[#0047BA]/50"
        >
          <Mail className="w-5 h-5 text-blue-100 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">Continue with Email</span>
        </button>

        {/* OR Divider */}
        <div className="relative flex py-1.5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* 3. Continue with Phone Number - Small & without box */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSelectPhone}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#0047BA] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50 focus:outline-none group cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0047BA] transition-colors" />
            <span>Continue with Phone Number</span>
          </button>
        </div>
      </div>

      {/* Footer Legal Terms */}
      <div className="mt-8 text-center text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-5">
        By continuing, you agree to DealDoko&apos;s{" "}
        <Link
          href="/terms"
          target="_blank"
          className="text-[#0047BA] hover:underline font-medium"
        >
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-[#0047BA] hover:underline font-medium"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};

export default AuthMethodSelector;
