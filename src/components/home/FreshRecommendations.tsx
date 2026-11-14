"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { Sparkles, ChevronDown } from "lucide-react";

interface FreshRecommendationsProps {
  initialProducts: Product[];
}

export function FreshRecommendations({ initialProducts }: FreshRecommendationsProps) {
  const { userAds, selectedLocation } = useMarketplace();
  const [displayCount, setDisplayCount] = useState(12);

  // Combine user posted ads + initial products
  const combined = [...userAds, ...initialProducts];

  // Filter by location if selected
  const filtered =
    selectedLocation && selectedLocation !== "All Nepal" && selectedLocation !== "All India"
      ? combined.filter((p) => p.location.city.toLowerCase() === selectedLocation.toLowerCase())
      : combined;

  const visibleProducts = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <section className="my-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 text-[#0047BA]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fresh Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              {selectedLocation !== "All Nepal" && selectedLocation !== "All India"
                ? `Recently posted advertisements in ${selectedLocation}`
                : "Handpicked newly listed advertisements across Nepal"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {visibleProducts.length} of {filtered.length} Ads
        </span>
      </div>

      <ProductGrid products={visibleProducts} />

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            rightIcon={<ChevronDown className="w-4 h-4" />}
            onClick={() => setDisplayCount((prev) => prev + 8)}
            className="px-8 font-bold border-2"
          >
            Load More Recommendations
          </Button>
        </div>
      )}
    </section>
  );
}
