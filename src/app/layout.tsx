import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { MainHeader } from "@/components/layout/MainHeader";
import { CategoryNavigation } from "@/components/layout/CategoryNavigation";
import { MainFooter } from "@/components/layout/MainFooter";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LocationModal } from "@/components/layout/LocationModal";
import { AuthModal } from "@/components/layout/AuthModal";
import { ChatModal } from "@/components/chat/ChatModal";

export const metadata: Metadata = {
  title: "DealDoko — Buy • Sell • Find in Nepal | dealdoko.com",
  description:
    "DealDoko (dealdoko.com) is Nepal's premier online classifieds platform. Buy and sell used cars, bikes, mobile phones, apartments, electronics, and furniture with verified buyers and sellers across Kathmandu, Pokhara, and Nepal.",
  keywords: [
    "dealdoko",
    "dealdoko.com",
    "nepal classifieds",
    "buy sell nepal",
    "second hand bikes nepal",
    "used cars kathmandu",
    "used mobiles pokhara",
    "hamrobazar alternative",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F7F9FC] text-slate-900 selection:bg-[#FF6A00] selection:text-white" suppressHydrationWarning>
        <ReduxProvider>
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
        </ReduxProvider>
      </body>
    </html>
  );
}
