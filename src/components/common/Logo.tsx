import Link from "next/link";
import Image from "next/image";
import React from "react";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({
  className = "",
  variant = "default",
  size = "md",
}: LogoProps) {
  const isLight = variant === "light";

  const heightClasses = {
    sm: "h-8 sm:h-9 w-auto",
    md: "h-10 sm:h-12 w-auto",
    lg: "h-12 sm:h-14 lg:h-16 xl:h-18 w-auto",
    xl: "h-16 sm:h-20 xl:h-22 w-auto",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none group transition-transform duration-200 hover:scale-[1.02] ${
        isLight ? "bg-white px-3.5 py-2 rounded-xl shadow-xs" : ""
      } ${className}`}
    >
      <div className="relative flex items-center">
        <Image
          src="/dealdoko-logo.png"
          alt="DealDoko.com - Buy, Sell, Find in Nepal"
          width={945}
          height={325}
          priority
          className={`${heightClasses[size]} object-contain`}
        />
      </div>
    </Link>
  );
}
