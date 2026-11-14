"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  verifyOtp,
  resendOtp,
  decrementTimer,
  clearAuthError,
  clearAuthSuccess,
  clearOtpPending,
} from "@/store/slices/authSlice";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Logo } from "@/components/common/Logo";
import {
  Mail,
  Lock,
  CheckCircle2,
  KeyRound,
  RotateCw,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Countdown timer for 1-minute OTP
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

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/profile");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!email.trim()) {
      err.email = "Email address is required";
    }
    if (!password) {
      err.password = "Password is required";
    } else if (password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }

    setErrors(err);

    if (Object.keys(err).length === 0) {
      dispatch(loginUser({ email: email.trim(), password }));
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrors({ otp: "Please enter the 6-digit code" });
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">
          Log in to manage your advertisements, chat with buyers, and view saved deals
        </p>
      </div>

      {isAuthenticated ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-slate-900">Login Successful!</h3>
          <p className="text-xs text-slate-500">Redirecting to your account dashboard...</p>
        </div>
      ) : isOtpPending ? (
        /* OTP Verification Screen */
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => {
              dispatch(clearOtpPending());
              dispatch(clearAuthError());
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0047BA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047BA] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
              <KeyRound className="w-6 h-6 text-[#0047BA]" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Email Verification</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We just sent a 6-digit verification code to{" "}
              <strong className="text-slate-800">{otpPendingEmail}</strong>.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  if (errors.otp) setErrors({});
                }}
                placeholder="••••••"
                className="w-full text-center text-2xl font-black tracking-widest py-3 rounded-xl border border-slate-300 focus:border-[#0047BA] focus:ring-2 focus:ring-[#0047BA]/20 outline-none font-mono"
                autoFocus
                required
              />
              {errors.otp && (
                <p className="text-xs text-rose-500 text-center mt-1">{errors.otp}</p>
              )}
            </div>

            {/* Live 1-Minute Countdown */}
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
        /* Login Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. arjun@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full font-bold bg-[#0047BA] hover:bg-[#003894] text-white py-3 rounded-xl shadow-md"
          >
            Log In
          </Button>

          <p className="text-center text-xs text-slate-500 pt-3">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0047BA] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
