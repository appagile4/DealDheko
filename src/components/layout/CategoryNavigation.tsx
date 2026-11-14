"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { MegaMenu } from "./MegaMenu";

const QUICK_CATEGORIES = [
  { label: "Cars", href: "/category/cars" },
  { label: "Motorcycles", href: "/category/bikes?sub=motorcycles" },
  { label: "Mobile Phones", href: "/category/mobiles?sub=mobile-phones" },
  { label: "For Sale: Houses & Apartments", href: "/category/properties?sub=houses-sale" },
  { label: "For Rent: Houses & Apartments", href: "/category/properties?sub=houses-rent" },
  { label: "Beds & Wardrobes", href: "/category/furniture?sub=beds-wardrobes" },
  { label: "TVs, Video & Audio", href: "/category/electronics?sub=tvs-audio" },
];

export function CategoryNavigation() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <div className="relative bg-white border-b border-slate-200 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 h-10 overflow-x-auto no-scrollbar">
          {/* All Categories Button */}
          <button
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className={`flex items-center gap-1.5 font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shrink-0 transition-colors ${
              isMegaMenuOpen
                ? "bg-[#0047BA] text-white"
                : "text-slate-900 hover:text-[#FF6A00] hover:bg-slate-50"
            }`}
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isMegaMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Quick Categories Bar */}
          <div className="flex items-center space-x-5 text-slate-700 shrink-0 font-medium whitespace-nowrap">
            {QUICK_CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="hover:text-[#FF6A00] transition-colors py-1 inline-block"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
    </div>
  );
}
