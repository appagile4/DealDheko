"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function HeroBanner() {
  return (
    <div className="my-4 sm:my-6">
      <Link
        href="/search"
        className="group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 bg-white"
        aria-label="Nepal's Trusted Online Marketplace — DealDoko. Start shopping now."
      >
        <div className="relative w-full aspect-[1024/384]">
          <Image
            src="/dealdoko-hero-banner.jpg"
            alt="DealDoko.com — Nepal's Trusted Online Marketplace | Discover great deals, buy & sell anything, and find what you need in Nepal"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
            className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      </Link>
    </div>
  );
}
