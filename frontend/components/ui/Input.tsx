"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        aria-invalid={error || undefined}
        className={[
          "w-full h-9 px-3 rounded-md text-sm",
          "bg-white text-[#0f172a] placeholder:text-[#94a3b8]",
          "border",
          error
            ? "border-[#ef4444] focus-visible:outline-[#ef4444]"
            : "border-[#e2e8f0] focus-visible:outline-[#0d9488]",
          "focus-visible:outline-2 focus-visible:outline-offset-0",
          "disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#f8fafc]",
          "transition-colors",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }
);

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        aria-invalid={error || undefined}
        className={[
          "w-full min-h-[80px] px-3 py-2 rounded-md text-sm",
          "bg-white text-[#0f172a] placeholder:text-[#94a3b8]",
          "border resize-y",
          error
            ? "border-[#ef4444] focus-visible:outline-[#ef4444]"
            : "border-[#e2e8f0] focus-visible:outline-[#0d9488]",
          "focus-visible:outline-2 focus-visible:outline-offset-0",
          "disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#f8fafc]",
          "transition-colors",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }
);

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, className = "", ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        aria-invalid={error || undefined}
        className={[
          "w-full h-9 px-3 rounded-md text-sm appearance-none",
          "bg-white text-[#0f172a]",
          "border",
          error
            ? "border-[#ef4444] focus-visible:outline-[#ef4444]"
            : "border-[#e2e8f0] focus-visible:outline-[#0d9488]",
          "focus-visible:outline-2 focus-visible:outline-offset-0",
          "disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#f8fafc]",
          "transition-colors",
          "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }
);

// ---------------------------------------------------------------------------
// FormField — label + input + helper/error
// ---------------------------------------------------------------------------

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className = "",
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[#0f172a] leading-none"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[#991b1b]">
            *
          </span>
        )}
        {required && (
          <span className="sr-only"> (required)</span>
        )}
      </label>

      {/* Inject aria-describedby on the first interactive child via cloneElement */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id: htmlFor,
            "aria-describedby":
              [hintId, errorId].filter(Boolean).join(" ") || undefined,
            "aria-invalid": error ? true : undefined,
          })
        : children}

      {hint && !error && (
        <p id={hintId} className="text-xs text-[#64748b]">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-[#991b1b] flex items-center gap-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}
