"use client";

import React from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { MOCK_PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { Heart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, userAds } = useMarketplace();

  // Find all saved products from mock products + user posted ads
  const allAvailable = [...userAds, ...MOCK_PRODUCTS];
  const savedProducts = allAvailable.filter((p) => wishlist.includes(p.id));

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Wishlist" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-2 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
            <Heart className="w-6 h-6 fill-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Saved Advertisements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              You have {savedProducts.length} saved {savedProducts.length === 1 ? "ad" : "ads"}
            </p>
          </div>
        </div>
      </div>

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-400" />}
          title="Your wishlist is empty"
          description="Explore our marketplace and click the heart icon on any advertisement to save it here for later review."
          actionText="Discover Deals"
          actionHref="/"
        />
      )}
    </div>
  );
}
