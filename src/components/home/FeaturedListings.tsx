"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { Flame, ArrowRight } from "lucide-react";
import { getFeaturedAds } from "@/lib/advertisementApi";

interface FeaturedListingsProps {
  products: Product[];
}

export function FeaturedListings({ products: initialProducts }: FeaturedListingsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const live = await getFeaturedAds(8);
        if (isMounted && live.length > 0) {
          setProducts(live);
        }
      } catch {
        // Fallback to initial products
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="my-10 p-6 sm:p-8 bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent rounded-3xl border border-orange-200/60 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FF6A00] text-white shadow-sm">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Advertisements
            </h2>
            <p className="text-xs text-slate-600">
              Top promoted verified listings with maximum buyer interest
            </p>
          </div>
        </div>

        <Link
          href="/search?featured=true"
          className="text-xs font-bold text-[#0047BA] hover:text-[#FF6A00] flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
