import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "sell" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm font-bold rounded-xl gap-2",
      lg: "px-6 py-3 text-base font-bold rounded-2xl gap-2.5",
    };

    const variantClasses = {
      primary:
        "bg-[#0047BA] text-white hover:bg-[#003894] active:bg-[#002D72] shadow-sm hover:shadow transition-all duration-150",
      secondary:
        "bg-[#FF6A00] text-white hover:bg-[#E65F00] active:bg-[#CC5400] shadow-sm hover:shadow transition-all duration-150",
      outline:
        "border-2 border-slate-300 text-slate-800 bg-transparent hover:border-[#0047BA] hover:text-[#0047BA] hover:bg-slate-50 active:bg-slate-100 transition-all duration-150",
      sell:
        "relative overflow-hidden font-black text-white bg-gradient-to-r from-[#FF6A00] via-[#FF7D1A] to-[#FF6A00] border-2 border-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 uppercase tracking-wider",
      ghost:
        "text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors duration-150",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-all duration-150",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none transition-all",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
