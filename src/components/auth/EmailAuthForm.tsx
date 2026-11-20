"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { useAppDispatch } from "@/store";
import { sendEmailOtpUnified, loginUser } from "@/store/slices/authSlice";

interface EmailAuthFormProps {
  onBack: () => void;
  onOtpSent: (email: string, exists: boolean) => void;
  onSuccess?: () => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  onBack,
  onOtpSent,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      setLoading(true);
      const action = await dispatch(sendEmailOtpUnified({ email: cleanEmail }));
      if (sendEmailOtpUnified.fulfilled.match(action)) {
        onOtpSent(cleanEmail, Boolean(action.payload.exists));
      } else {
        setError(
          (action.payload as string) ||
            "Failed to send verification code. Please check your email."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    try {
      setLoading(true);
      const action = await dispatch(loginUser({ email: cleanEmail, password }));
      if (loginUser.fulfilled.match(action)) {
        onSuccess?.();
      } else {
        setError(
          (action.payload as string) ||
            "Invalid email or password. Please try again."
        );
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-slate-800">
      {/* Top Navigation */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-5 w-fit focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to login options</span>
      </button>

      {/* Segmented Tab Switcher: Email OTP vs Password Login */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("otp");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
            activeTab === "otp"
              ? "bg-white text-[#0047BA] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Email OTP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("password");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
            activeTab === "password"
              ? "bg-white text-[#0047BA] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password Login</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {activeTab === "otp" ? "Continue with Email OTP" : "Log in with Password"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {activeTab === "otp"
            ? "We'll send a 6-digit verification code. Existing users log in directly; new users will set a password."
            : "Enter your registered email address and password."}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* TAB 1: Email OTP Form */}
      {activeTab === "otp" ? (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="auth-email-input"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0047BA] hover:bg-[#003893] text-white font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2 focus:outline-none focus:ring-2 focus:ring-[#0047BA]/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Send OTP & Continue</span>
            )}
          </button>
        </form>
      ) : (
        /* TAB 2: Password Login Form */
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email-pass-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="auth-email-pass-input"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="auth-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0047BA] hover:bg-[#003893] text-white font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2 focus:outline-none focus:ring-2 focus:ring-[#0047BA]/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        {activeTab === "otp"
          ? "Existing accounts log in directly upon verification. New users set a password in the next step."
          : "Can't remember your password? Use Email OTP to sign in instantly."}
      </p>
    </div>
  );
};

export default EmailAuthForm;
