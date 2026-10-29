"use client";

import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Renders the button as a full-width block element */
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0f766e] text-white hover:bg-[#115e59] active:bg-[#115e59] border border-[#0f766e] hover:border-[#115e59]",
  secondary:
    "bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] active:bg-[#e2e8f0] border border-[#e2e8f0]",
  outline:
    "bg-white text-[#0f172a] hover:bg-[#f8fafc] active:bg-[#f1f5f9] border border-[#e2e8f0]",
  ghost:
    "bg-transparent text-[#475569] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] border border-transparent",
  destructive:
    "bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] active:bg-[#fca5a5] border border-[#fecaca]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center font-medium rounded-md",
        "transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]",
        "disabled:opacity-50 disabled:pointer-events-none",
        "select-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="shrink-0 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      {children}
    </button>
  );
}
