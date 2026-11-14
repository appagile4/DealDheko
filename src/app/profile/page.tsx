"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { MOCK_PRODUCTS } from "@/data/products";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  LogOut,
  PackageCheck,
  Heart,
  ShieldCheck,
  Edit3,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, userAds, wishlist } = useMarketplace();
  const [activeTab, setActiveTab] = useState<"my-ads" | "wishlist">("my-ads");

  if (!user) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<User className="w-8 h-8 text-slate-400" />}
          title="Please log in to view your profile"
          description="Log in to manage your active advertisements, see buyer enquiries, and update profile settings."
          actionText="Log In Now"
          actionHref="/login"
        />
      </div>
    );
  }

  // Saved items from wishlist
  const savedAds = [...userAds, ...MOCK_PRODUCTS].filter((p) => wishlist.includes(p.id));

  const breadcrumbItems = [
    { label: "My Profile" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm shrink-0">
              <Image
                src={user.avatar}
                alt={user.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-600" title="Verified Account">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/profile/edit" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Edit3 className="w-4 h-4 text-[#0047BA]" />}
                className="w-full sm:w-auto font-bold border-2 border-slate-300 text-slate-800 hover:border-[#0047BA] hover:text-[#0047BA]"
              >
                Edit Profile
              </Button>
            </Link>
            <Link href="/post-ad" className="flex-1 sm:flex-none">
              <Button
                variant="sell"
                size="md"
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="w-full sm:w-auto"
              >
                Post Ad
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("my-ads")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "my-ads"
              ? "text-[#0047BA] border-b-2 border-[#0047BA]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>My Posted Advertisements ({userAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "wishlist"
              ? "text-[#0047BA] border-b-2 border-[#0047BA]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Advertisements ({savedAds.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "my-ads" && (
        <div className="space-y-4">
          {userAds.length > 0 ? (
            <ProductGrid products={userAds} />
          ) : (
            <EmptyState
              icon={<PackageCheck className="w-8 h-8 text-slate-400" />}
              title="You haven't posted any advertisements yet"
              description="Post your unused electronics, vehicles, furniture, or properties to reach thousands of buyers."
              actionText="Post Your First Ad"
              actionHref="/post-ad"
            />
          )}
        </div>
      )}

      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {savedAds.length > 0 ? (
            <ProductGrid products={savedAds} />
          ) : (
            <EmptyState
              icon={<Heart className="w-8 h-8 text-rose-400" />}
              title="No saved advertisements"
              description="Browse the marketplace and bookmark ads by clicking the heart button."
              actionText="Explore Marketplace"
              actionHref="/"
            />
          )}
        </div>
      )}
    </div>
  );
}
