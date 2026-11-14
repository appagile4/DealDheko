import React from "react";
import { Sparkles } from "lucide-react";

export function FeaturedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FF6A00] text-white text-[10px] font-black uppercase tracking-wider shadow-sm ${className}`}
    >
      <Sparkles className="w-3 h-3 fill-white" />
      <span>Featured</span>
    </span>
  );
}
