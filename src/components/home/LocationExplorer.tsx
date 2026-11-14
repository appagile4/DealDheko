"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { MapPin, Navigation } from "lucide-react";

const CITIES = [
  { name: "Kathmandu", state: "Bagmati Province", count: "14,800+ ads" },
  { name: "Pokhara", state: "Gandaki Province", count: "9,400+ ads" },
  { name: "Lalitpur", state: "Bagmati Province", count: "7,800+ ads" },
  { name: "Bhaktapur", state: "Bagmati Province", count: "4,600+ ads" },
  { name: "Bharatpur", state: "Chitwan / Bagmati", count: "5,300+ ads" },
  { name: "Biratnagar", state: "Koshi Province", count: "6,200+ ads" },
  { name: "Birgunj", state: "Madhesh Province", count: "4,900+ ads" },
  { name: "Butwal", state: "Lumbini Province", count: "5,100+ ads" },
  { name: "Dharan", state: "Koshi Province", count: "3,800+ ads" },
  { name: "Nepalgunj", state: "Lumbini Province", count: "3,200+ ads" },
];

export function LocationExplorer() {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useMarketplace();

  const handleCityClick = (cityName: string) => {
    setSelectedLocation(cityName);
    router.push(`/search?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <section className="my-10 space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-blue-100 text-[#0047BA]">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse by City
          </h2>
          <p className="text-xs text-slate-500">
            Explore active local advertisements across major cities and provinces
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CITIES.map((city) => {
          const isSelected = selectedLocation.toLowerCase() === city.name.toLowerCase();

          return (
            <button
              key={city.name}
              onClick={() => handleCityClick(city.name)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#0047BA] text-white border-[#0047BA] shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-[#FF6A00] hover:shadow-md text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin
                  className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300" : "text-[#FF6A00]"}`}
                />
                <span className="font-bold text-sm truncate">{city.name}</span>
              </div>
              <div className="text-[11px] opacity-70 truncate">{city.state}</div>
              <div
                className={`text-[10px] mt-1 font-semibold ${
                  isSelected ? "text-amber-300" : "text-slate-400"
                }`}
              >
                {city.count}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
