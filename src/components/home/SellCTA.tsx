import React from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { PlusCircle, ShieldCheck, Zap, Users } from "lucide-react";

export function SellCTA() {
  return (
    <section className="my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0047BA] via-[#003B95] to-[#002466] text-white p-8 sm:p-12 border border-blue-900 shadow-2xl">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FF6A00]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
            <Zap className="w-3.5 h-3.5 fill-orange-300" />
            <span>Fast, Easy &amp; 100% Free</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Have something to sell?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
            Turn your unused products into great deals. List your advertisement on DealDoko in less than 2 minutes and connect with genuine buyers across Nepal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Safe &amp; Verified Buyers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                <Users className="w-4 h-4" />
              </div>
              <span>Direct Chat Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-orange-300">
                <PlusCircle className="w-4 h-4" />
              </div>
              <span>Unlimited Free Photos</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
          <Link href="/post-ad" className="w-full sm:w-auto">
            <Button
              variant="sell"
              size="lg"
              leftIcon={<PlusCircle className="w-5 h-5 stroke-[2.5]" />}
              className="w-full sm:w-auto px-8 py-4 text-base font-black shadow-xl"
            >
              Post Your First Ad
            </Button>
          </Link>
          <span className="text-[11px] text-blue-200 mt-2 block">
            No listing fee or commission charged
          </span>
        </div>
      </div>
    </section>
  );
}
