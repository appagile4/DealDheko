"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { POPULAR_CITIES } from "@/data/locations";
import { useMarketplace } from "@/context/MarketplaceContext";
import { MapPin, Search, Check } from "lucide-react";

export function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, selectedLocation, setSelectedLocation } =
    useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCities = POPULAR_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName: string) => {
    setSelectedLocation(cityName);
    closeLocationModal();
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title="Select Your Location"
      description="Choose your city to discover deals and advertisements near you"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search city, district or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-[#0A2540] focus:ring-1 focus:ring-[#0A2540]"
            autoFocus
          />
        </div>

        {/* Current / All India */}
        <div className="pt-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Popular Cities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredCities.map((city) => {
              const isSelected = selectedLocation.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-sm transition-all ${
                    isSelected
                      ? "border-[#0047BA] bg-[#0047BA]/10 text-[#0047BA] font-semibold"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#FF6A00]" : "text-slate-400"}`} />
                    <div className="truncate">
                      <span className="block truncate">{city.name}</span>
                      {city.name !== "All Nepal" && city.name !== "All India" && (
                        <span className="text-[10px] text-slate-400 block truncate">{city.state}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0047BA] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">
            No cities found matching &quot;{searchQuery}&quot;. Try searching for Delhi, Mumbai, or Bangalore.
          </div>
        )}
      </div>
    </Modal>
  );
}
