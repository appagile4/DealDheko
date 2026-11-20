"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Camera,
  Trash2,
  Upload,
  Check,
  User,
  ShieldCheck,
  Lock,
  Loader2,
} from "lucide-react";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
];

export default function EditProfilePage() {
  const { user, updateUser, uploadAvatar, isUploadingAvatar } = useMarketplace();

  // Active navigation tab on the left sidebar
  const [activeTab, setActiveTab] = useState<"edit-profile" | "profile-picture">("edit-profile");

  // Form states initialized with user data
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "");
  const [phoneCode, setPhoneCode] = useState("+977");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace(/^\+\d+\s*/, "") || ""
  );
  const [avatar, setAvatar] = useState(
    user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
  );
  const [isGoogleLinked, setIsGoogleLinked] = useState(
    user?.isGoogleLinked !== undefined ? user.isGoogleLinked : false
  );

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle image upload to Cloudinary and store URL on MongoDB
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image file size should not exceed 10MB.");
      return;
    }

    setUploadError(null);
    try {
      // Direct stream to Cloudinary and save to MongoDB
      const uploadedUrl = await uploadAvatar(file);
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setUploadError("Failed to upload image to Cloudinary. Please try again.");
      }
    } catch {
      setUploadError("An error occurred during upload. Please check your connection.");
    }
  };

  // Keep in sync with user if context updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAbout(user.about || "");
      setAvatar(user.avatar);
      if (user.phone) {
        if (user.phone.startsWith("+91")) {
          setPhoneCode("+91");
          setPhoneNumber(user.phone.replace("+91", "").trim());
        } else if (user.phone.startsWith("+977")) {
          setPhoneCode("+977");
          setPhoneNumber(user.phone.replace("+977", "").trim());
        } else {
          setPhoneNumber(user.phone.trim());
        }
      }
      if (user.isGoogleLinked !== undefined) {
        setIsGoogleLinked(user.isGoogleLinked);
      }
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fullPhone = `${phoneCode} ${phoneNumber.trim()}`;

    setTimeout(() => {
      updateUser({
        name: name.trim(),
        about: about.trim(),
        phone: fullPhone,
        avatar,
        isGoogleLinked,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 400);
  };

  const handleDiscard = () => {
    if (user) {
      setName(user.name);
      setAbout(user.about || "");
      setAvatar(user.avatar);
      setPhoneNumber(user.phone?.replace(/^\+\d+\s*/, "") || "");
      setIsGoogleLinked(user.isGoogleLinked ?? false);
    }
  };

  const toggleGoogleLink = () => {
    setIsGoogleLinked((prev) => !prev);
  };

  if (!user) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Sign in to edit your profile</h2>
          <p className="text-sm text-slate-500 mb-6">
            You must be logged into your DealDoko account to update your profile details and settings.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold bg-[#0047BA] text-white hover:bg-[#003893] transition-all shadow-sm"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "My Profile", href: "/profile" },
    { label: "Edit Profile" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile updated successfully! Your changes are now live.</span>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            View live profile →
          </Link>
        </div>
      )}

      {/* Main 2-Column Container */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-56 lg:w-64 shrink-0 space-y-6">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("edit-profile")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "edit-profile"
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Edit Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile-picture")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "profile-picture"
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Profile picture
            </button>
          </div>

          {/* View Profile Action Button */}
          <Link href="/profile" className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-[#0047BA] text-[#0047BA] hover:bg-blue-50 font-bold rounded-lg py-2.5 text-sm transition-colors text-center"
            >
              View profile
            </Button>
          </Link>

          {/* Delete Account Sidebar Link */}
          <Link href="/delete-account" className="block mt-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete Account</span>
            </button>
          </Link>
        </aside>

        {/* Right Main Form Card */}
        <main className="flex-1 w-full bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {activeTab === "edit-profile" ? (
            <form onSubmit={handleSave}>
              {/* Card Title */}
              <div className="px-6 sm:px-8 py-4 border-b border-slate-200">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Edit Profile
                </h1>
              </div>

              {/* Section 1: Basic Information */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Basic information
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Form Inputs */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Name Input */}
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          maxLength={30}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA] outline-none transition-all placeholder:text-slate-400"
                          required
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-right mt-1 font-mono">
                        {name.length} / 30
                      </div>
                    </div>

                    {/* About me Textarea */}
                    <div>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={about}
                          maxLength={200}
                          onChange={(e) => setAbout(e.target.value)}
                          placeholder="About me (optional)"
                          className="w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA] outline-none transition-all placeholder:text-slate-400 resize-none"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-right mt-1 font-mono">
                        {about.length} / 200
                      </div>
                    </div>
                  </div>

                  {/* Right Help Box: "Why is it important?" */}
                  <div className="lg:col-span-4 border border-slate-200 bg-slate-50/70 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Why is it important?</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      DealDoko is built on trust. Help other people get to know
                      you. Tell them about the things you like. Share your
                      favorite brands, books, movies, shows, music, food. And you
                      will see the results...
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Contact information
                </h2>

                {/* Phone Number Field */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 max-w-md flex items-center rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA] transition-all overflow-hidden">
                      {/* Country Code Select */}
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="bg-slate-50 px-2.5 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-200 outline-none cursor-pointer"
                      >
                        <option value="+977">+977 (NP)</option>
                        <option value="+91">+91 (IN)</option>
                      </select>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone Number"
                        className="flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none"
                        required
                      />

                      <div className="pr-3 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Yay! Your number is verified.</span>
                    </div>
                  </div>
                </div>

                {/* Email Field - Read Only / Locked */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div
                      className="flex-1 max-w-md flex items-center rounded-lg border border-slate-200 bg-slate-50/90 text-slate-700 transition-all overflow-hidden cursor-not-allowed select-none"
                      title="Email address cannot be changed"
                    >
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        disabled
                        aria-readonly="true"
                        placeholder="your.email@example.com"
                        className="flex-1 px-3.5 py-2.5 text-sm text-slate-700 bg-transparent outline-none cursor-not-allowed font-medium"
                      />
                      <div className="pr-3 flex items-center gap-1.5 text-slate-400">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Your email is never shared with external parties nor do we
                        use it to spam you in any way.
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Email address cannot be changed</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Information */}
              <div className="px-6 sm:px-8 py-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Additional information
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Google</h3>
                      {isGoogleLinked && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Linked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Link your Google account to seamlessly use your contact list.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleGoogleLink}
                    className="w-full sm:w-auto px-8 py-2 text-sm font-bold rounded-lg border-2 border-[#0047BA] text-[#0047BA] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    {isGoogleLinked ? "Unlink" : "Link Google"}
                  </button>
                </div>
              </div>

              {/* Section 4: Danger Zone / Delete Account */}
              <div className="px-6 sm:px-8 py-6 border-t border-slate-200 bg-rose-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      Delete DealDoko Account
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Permanently delete your DealDoko account, active advertisements, messages, and personal information. This action is irreversible.
                    </p>
                  </div>

                  <Link href="/delete-account" className="w-full sm:w-auto shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 font-bold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Delete Account
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-sm font-bold text-[#0047BA] hover:underline cursor-pointer"
                >
                  Discard
                </button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#002F6C] hover:bg-[#00204E] text-white font-bold px-7 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          ) : (
            /* Profile Picture Tab */
            <div className="space-y-6">
              {/* Card Title */}
              <div className="px-6 sm:px-8 py-4 border-b border-slate-200">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Profile picture
                </h1>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-6">
                {/* Current Avatar Display */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md shrink-0">
                    <Image
                      src={avatar}
                      alt={name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-center sm:text-left">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Clear profile pictures help buyers and sellers trust you
                        faster on DealDoko. Photos are stored securely on Cloudinary.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <label
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0047BA] hover:bg-[#003894] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors ${
                          isUploadingAvatar ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                        }`}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingAvatar}
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                      </label>

                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() =>
                          setAvatar(
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Reset to default</span>
                      </button>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-rose-600 font-medium animate-in fade-in">
                        {uploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Or choose from popular avatars:
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                          avatar === url
                            ? "border-[#0047BA] ring-2 ring-[#0047BA]/30 scale-105"
                            : "border-slate-200 hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Preset avatar ${idx + 1}`}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (user) setAvatar(user.avatar);
                  }}
                  className="text-sm font-bold text-[#0047BA] hover:underline cursor-pointer"
                >
                  Discard
                </button>

                <Button
                  type="button"
                  disabled={isSaving || isUploadingAvatar}
                  onClick={() => {
                    updateUser({ avatar });
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }}
                  className="bg-[#002F6C] hover:bg-[#00204E] text-white font-bold px-7 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  {isSaving || isUploadingAvatar ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
