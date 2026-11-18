"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import {
  AlertTriangle,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  KeyRound,
  ArrowLeft,
  Loader2,
  Clock,
  HelpCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  PackageX,
  HeartOff,
} from "lucide-react";

const REASONS = [
  "I have found what I was looking for",
  "I have privacy or data security concerns",
  "I receive too many messages or notifications",
  "I am switching to another account",
  "I encountered technical issues or bugs",
  "I am no longer using classified marketplaces in Nepal",
  "Other reason",
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, logout } = useMarketplace();

  // Form State
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [otp, setOtp] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  // Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    details?: { adsDeleted: number; messagesDeleted: number; conversationsDeleted: number };
  } | null>(null);

  // Auto-populate email if user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Handle OTP Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Request 6-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (!reason) {
      setErrorMessage("Please choose a reason for deleting your account.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await api.post("/auth/delete-account/send-otp", {
        email: cleanEmail,
      });

      if (response.data?.success) {
        setOtpSent(true);
        setOtpCooldown(60);
      } else {
        setErrorMessage(response.data?.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Could not send verification code. Please make sure the email is registered.";
      setErrorMessage(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Confirm Permanent Account & Data Deletion
  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (!isAgreed) {
      setErrorMessage("Please confirm you understand that account deletion is permanent and cannot be undone.");
      return;
    }

    const doubleCheck = window.confirm(
      "FINAL CONFIRMATION:\n\nAre you absolutely sure you want to permanently delete your DealDoko account? All your advertisements, chat histories, and profile data will be permanently erased and cannot be recovered."
    );
    if (!doubleCheck) return;

    setIsDeleting(true);
    try {
      const response = await api.post("/auth/delete-account/confirm", {
        email: cleanEmail,
        otp: cleanOtp,
        reason,
        reasonDetails,
      });

      if (response.data?.success) {
        // Clear auth state in website
        logout();
        setSuccessResult({
          message: response.data.message || "Your account has been permanently deleted.",
          details: response.data.details,
        });
      } else {
        setErrorMessage(response.data?.message || "Account deletion could not be completed.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Verification failed. Please check your OTP code and try again.";
      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // SUCCESS STATE VIEW
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Account Permanently Deleted
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your DealDoko account, active advertisements, messages, and personal information have been completely erased from our database.
            </p>
          </div>

          {/* Details summary */}
          {successResult.details && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5">
              <div className="font-bold text-slate-800 pb-1 border-b border-slate-200">Data Cleared Summary:</div>
              <div className="flex justify-between">
                <span>Advertisements purged:</span>
                <span className="font-semibold text-slate-900">{successResult.details.adsDeleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Chat conversations cleared:</span>
                <span className="font-semibold text-slate-900">{successResult.details.conversationsDeleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct messages deleted:</span>
                <span className="font-semibold text-slate-900">{successResult.details.messagesDeleted}</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left max-w-md mx-auto flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              You will no longer be able to log in or recover any previously listed items or buyer messages. If you wish to use DealDoko again in the future, you may register a new account anytime.
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto"
            >
              Return to DealDoko Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DELETION FORM VIEW
  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#0047BA] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/profile" className="hover:text-[#0047BA] transition-colors">
          Profile &amp; Settings
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Delete Account</span>
      </nav>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-rose-800/40">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/30 text-xs font-bold text-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Account Security &amp; Data Privacy</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Delete DealDoko <span className="text-rose-400">Account &amp; Data</span>
          </h1>

          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
            We value your privacy. You can permanently delete your DealDoko account and purge all personal listings, inquiries, and chat data in accordance with our data privacy guidelines and Apple &amp; Google account deletion policies.
          </p>
        </div>
      </div>

      {/* Critical Permanent Loss Warning Banner */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-sm shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-rose-950">
              Warning: Account Deletion is Permanent and Irreversible
            </h2>
            <p className="text-xs sm:text-sm text-rose-900 mt-1 leading-relaxed">
              Once you confirm deletion, <strong>your account will no longer be available</strong> and cannot be restored under any circumstances.
            </p>
          </div>
        </div>

        {/* Breakdown of what gets purged */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 flex items-start gap-2.5 text-slate-700">
            <PackageX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">All Posted Advertisements</strong>
              <span>Every active, pending, or archived listing will be permanently deleted from DealDoko.</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 flex items-start gap-2.5 text-slate-700">
            <MessageSquare className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Chats &amp; Inquiries</strong>
              <span>All message histories, buyer inquiries, and negotiation records will be erased.</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 flex items-start gap-2.5 text-slate-700">
            <HeartOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Wishlist &amp; Saved Searches</strong>
              <span>Your saved favorites and customized search preferences will be cleared.</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 flex items-start gap-2.5 text-slate-700">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 font-bold">Personal Profile &amp; Contact</strong>
              <span>Your phone, email credentials, avatar, and verification badges will be purged.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-150">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Deletion Request Error</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Main Interactive Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-8">
        {/* Step 1: Reason for Deletion */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#0047BA] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Why are you deleting your account? <span className="text-rose-600">*</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 pl-8">
            Your feedback helps our team improve DealDoko for all buyers and sellers across Nepal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8 pt-1">
            {REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all text-xs font-medium ${
                  reason === r
                    ? "border-[#0047BA] bg-blue-50/70 text-[#00225E] font-bold shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50"
                }`}
              >
                <input
                  type="radio"
                  name="deletion_reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-0.5 text-[#0047BA] focus:ring-[#0047BA]"
                />
                <span className="leading-snug">{r}</span>
              </label>
            ))}
          </div>

          <div className="pl-8 pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Details / Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Tell us what we could have done better..."
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047BA] text-slate-800 placeholder-slate-400"
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Step 2: Email & Verification Code Request */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#0047BA] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Verify Account Ownership via Email OTP <span className="text-rose-600">*</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 pl-8">
            To prevent unauthorized account deletion, we require a 6-digit verification code sent directly to your registered inbox.
          </p>

          <div className="pl-8 space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Registered DealDoko Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={otpSent}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047BA] text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 font-medium"
                />
              </div>
            </div>

            {/* Request OTP Button */}
            {!otpSent ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleRequestOtp}
                disabled={isSendingOtp || !email.trim() || !reason}
                leftIcon={
                  isSendingOtp ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0047BA]" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-[#0047BA]" />
                  )
                }
                className="w-full sm:w-auto font-bold"
              >
                {isSendingOtp ? "Sending 6-Digit Code..." : "Send Verification Code"}
              </Button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-[#00225E]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    A 6-digit verification code was sent to <strong>{email}</strong>. The code expires in 5 minutes.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Enter 6-Digit Security Code
                    </label>
                    {otpCooldown > 0 ? (
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Resend in {otpCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSendingOtp}
                        className="text-[11px] font-bold text-[#0047BA] hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full tracking-widest text-center text-xl font-mono font-bold py-2.5 rounded-xl border-2 border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-900 placeholder-slate-300 bg-rose-50/30"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 3: Explicit Irreversible Agreement Checkbox */}
        {otpSent && (
          <>
            <hr className="border-slate-100" />
            <section className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Final Acknowledgment &amp; Deletion Confirmation
                </h3>
              </div>

              <div className="pl-8 space-y-4 max-w-lg">
                <label className="flex items-start gap-3 p-4 bg-rose-50/70 border border-rose-200 rounded-2xl cursor-pointer text-xs text-rose-950 font-medium">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500 rounded-sm"
                  />
                  <span className="leading-relaxed">
                    I explicitly acknowledge that deleting my DealDoko account is permanent and cannot be undone. All my advertisements, chats, contacts, and personal data will be completely erased and will no longer be available.
                  </span>
                </label>

                {/* Final Destructive Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    onClick={handleConfirmDeletion}
                    disabled={isDeleting || !isAgreed || otp.trim().length !== 6}
                    leftIcon={
                      isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-white" />
                      )
                    }
                    className="w-full sm:w-auto font-black shadow-lg"
                  >
                    {isDeleting ? "Deleting Account & Purging Data..." : "Permanently Delete My Account"}
                  </Button>

                  <Link href="/profile" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full font-bold">
                      Cancel &amp; Keep Account
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Support & Inquiry Footer Card */}
      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-[#0047BA] shrink-0" />
          <span>
            Need help or having trouble with your listings? Contact our support team before deleting.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/contact" className="text-[#0047BA] font-bold hover:underline">
            Contact Support
          </Link>
          <span>•</span>
          <Link href="/privacy" className="text-slate-600 font-medium hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
