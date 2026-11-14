"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  signupUser,
  verifyOtp,
  resendOtp,
  decrementTimer,
  clearAuthError,
  clearAuthSuccess,
  clearOtpPending,
} from "@/store/slices/authSlice";
import {
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle,
  KeyRound,
  RotateCw,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useMarketplace();
  const dispatch = useAppDispatch();
  const {
    isLoading,
    error,
    successMessage,
    isOtpPending,
    otpPendingEmail,
    otpExpiresIn,
    isOtpExpired,
    isAuthenticated,
  } = useAppSelector((state) => state.auth);

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Countdown timer for 1-minute OTP expiration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOtpPending && otpExpiresIn > 0) {
      interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpPending, otpExpiresIn, dispatch]);

  // Close modal when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen && !isOtpPending) {
      const timer = setTimeout(() => {
        closeAuthModal();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAuthModalOpen, isOtpPending, closeAuthModal]);

  const validateLogin = () => {
    const err: Record<string, string> = {};
    if (!email.trim()) err.email = "Email is required";
    if (!password) {
      err.password = "Password is required";
    } else if (password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }
    setValidationErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateRegister = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Full name is required";
    if (!email.trim()) err.email = "Valid email is required";
    if (!phone.trim()) err.phone = "Phone number is required";
    if (!password) {
      err.password = "Password is required";
    } else if (password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }
    setValidationErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    dispatch(
      signupUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: "Kathmandu",
      })
    );
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setValidationErrors({ otp: "Please enter a valid 6-digit code" });
      return;
    }
    if (!otpPendingEmail) return;

    dispatch(
      verifyOtp({
        email: otpPendingEmail,
        otp: otpCode.trim(),
      })
    );
  };

  const handleResendOtp = () => {
    if (!otpPendingEmail) return;
    setOtpCode("");
    dispatch(resendOtp({ email: otpPendingEmail }));
  };

  const handleBackFromOtp = () => {
    dispatch(clearOtpPending());
    dispatch(clearAuthError());
    setOtpCode("");
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} maxWidth="md">
      {/* Success State */}
      {isAuthenticated ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-slate-900">
            {tab === "login" ? "Welcome back!" : "Account verified!"}
          </h3>
          <p className="text-sm text-slate-500">
            {successMessage || "You are now logged into DealDoko Nepal."}
          </p>
        </div>
      ) : isOtpPending ? (
        /* OTP Verification Screen */
        <div className="space-y-5 py-2">
          <button
            type="button"
            onClick={handleBackFromOtp}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0047BA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047BA] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
              <KeyRound className="w-6 h-6 text-[#0047BA]" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Email Verification
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We just sent a 6-digit code to{" "}
              <strong className="text-slate-800">{otpPendingEmail}</strong>.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && !error && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3 rounded-xl flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                  if (validationErrors.otp) setValidationErrors({});
                }}
                placeholder="••••••"
                className="w-full text-center text-2xl font-black tracking-widest py-3 rounded-xl border border-slate-300 focus:border-[#0047BA] focus:ring-2 focus:ring-[#0047BA]/20 outline-none font-mono"
                autoFocus
                required
              />
              {validationErrors.otp && (
                <p className="text-xs text-rose-500 text-center mt-1">
                  {validationErrors.otp}
                </p>
              )}
            </div>

            {/* Live 1-Minute Expiration Countdown */}
            <div className="text-center py-1">
              {!isOtpExpired ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Expires in: {formatTimer(otpExpiresIn)}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Code expired after 1 minute</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isOtpExpired || otpCode.length !== 6}
              className="w-full py-3 bg-[#0047BA] hover:bg-[#003894] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              Verify &amp; Activate Account
            </Button>

            {/* Resend OTP Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6A00] hover:text-[#E65F00] hover:underline disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resend Fresh OTP (1 min)</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Login / Register Forms */
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                dispatch(clearAuthError());
                dispatch(clearAuthSuccess());
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === "login"
                  ? "border-[#0047BA] text-[#0047BA]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                dispatch(clearAuthError());
                dispatch(clearAuthSuccess());
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                tab === "register"
                  ? "border-[#0047BA] text-[#0047BA]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={validationErrors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={validationErrors.password}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full font-bold bg-[#0047BA] hover:bg-[#003894] text-white py-3 rounded-xl shadow-md"
              >
                Log In to DealDoko
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <Input
                label="Full Name"
                placeholder="e.g. Arjun Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                error={validationErrors.name}
                required
              />

              <Input
                label="Email Address (for OTP)"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={validationErrors.email}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+977 98412 34567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                error={validationErrors.phone}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={validationErrors.password}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={validationErrors.confirmPassword}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full font-bold bg-[#FF6A00] hover:bg-[#E65F00] text-white py-3 rounded-xl shadow-md mt-2"
              >
                Create Account &amp; Send OTP
              </Button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
