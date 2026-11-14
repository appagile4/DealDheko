"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { MainHeader } from "@/components/layout/MainHeader";
import { CategoryNavigation } from "@/components/layout/CategoryNavigation";
import { MainFooter } from "@/components/layout/MainFooter";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LocationModal } from "@/components/layout/LocationModal";
import { AuthModal } from "@/components/layout/AuthModal";
import { ChatModal } from "@/components/chat/ChatModal";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Standalone dedicated white/brand layout for Superadmin Portal routes (/admin and /admin/dashboard)
  if (isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
        {children}
      </div>
    );
  }

  // Consumer marketplace layout for all public pages
  return (
    <MarketplaceProvider>
      {/* Main Top Header */}
      <MainHeader />

      {/* Secondary Category Navigation & Mega Menu */}
      <CategoryNavigation />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Footer */}
      <MainFooter />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation />

      {/* Global Modals */}
      <LocationModal />
      <AuthModal />
      <ChatModal />
    </MarketplaceProvider>
  );
}
