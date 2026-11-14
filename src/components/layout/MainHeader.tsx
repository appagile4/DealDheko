"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  MapPin,
  Search,
  Heart,
  User,
  Plus,
  ChevronDown,
  History,
  TrendingUp,
  X,
  MessageSquare,
} from "lucide-react";
import { POPULAR_SEARCH_KEYWORDS } from "@/data/searchSuggestions";
import { POPULAR_CITIES } from "@/data/locations";

export function MainHeader() {
  const router = useRouter();
  const {
    selectedLocation,
    setSelectedLocation,
    openLocationModal,
    wishlistCount,
    user,
    openAuthModal,
    recentSearches,
    addRecentSearch,
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState("");

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const locationBoxRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (locationBoxRef.current && !locationBoxRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    addRecentSearch(searchQuery);
    setIsSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    addRecentSearch(keyword);
    setIsSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const filteredDropdownCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(locationSearchInput.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[76px] sm:min-h-[84px] py-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Logo size="lg" />
          </div>

          {/* Location Picker (Desktop & Tablet) */}
          <div ref={locationBoxRef} className="relative hidden md:block w-40 lg:w-48 shrink-0">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-slate-300 hover:border-[#0047BA] bg-white text-left text-sm transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span className="truncate font-semibold text-slate-800">
                  {selectedLocation}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isLocationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Quick Location Dropdown */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-1 mb-2">
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={locationSearchInput}
                    onChange={(e) => setLocationSearchInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA]"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredDropdownCities.slice(0, 10).map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedLocation(city.name);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                        selectedLocation.toLowerCase() === city.name.toLowerCase()
                          ? "bg-[#0047BA]/10 text-[#0047BA] font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-[10px] text-slate-400">{city.state}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsLocationDropdownOpen(false);
                      openLocationModal();
                    }}
                    className="w-full text-center text-xs text-[#0047BA] hover:underline font-semibold py-1"
                  >
                    View all cities &amp; provinces →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Search Bar */}
          <div ref={searchBoxRef} className="relative flex-1">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Find Cars, Mobiles, Properties, Jobs and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-xl border-2 border-slate-300 bg-white pl-4 pr-12 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0047BA] focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#0047BA] hover:bg-[#003894] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Recent Searches</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(term)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Keywords */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Popular Searches</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {POPULAR_SEARCH_KEYWORDS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(item.text)}
                        className="text-left px-2 py-1.5 text-xs text-slate-700 hover:text-[#0047BA] hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{item.text}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          in {item.categorySlug}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#0047BA] hover:bg-slate-100 transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6A00] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Chat Link */}
            <Link
              href="/chat"
              className="hidden sm:flex relative p-2.5 rounded-xl text-slate-700 hover:text-[#0047BA] hover:bg-slate-100 transition-colors"
              title="Messages / Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* Real-time Notification Bell */}
            <NotificationBell />

            {/* Login or User Profile */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-800 truncate max-w-[90px]">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3 py-2 text-sm font-bold text-slate-800 hover:text-[#0047BA] hover:underline transition-all flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* + SELL Primary CTA Button */}
            <Link href="/post-ad">
              <Button
                variant="sell"
                size="md"
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="shadow-md"
              >
                SELL
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
