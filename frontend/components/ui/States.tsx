import React from "react";
import { Button } from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Primary action label */
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 gap-4",
        className,
      ].join(" ")}
    >
      {icon && (
        <div
          className="text-[#94a3b8] w-12 h-12 flex items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-[#0f172a]">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-[#64748b]">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorState
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "There was a problem loading this content. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={[
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 gap-4",
        className,
      ].join(" ")}
    >
      <div
        className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#991b1b]"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-[#0f172a]">{title}</h3>
        <p className="mt-1.5 text-sm text-[#64748b]">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotFound state
// ---------------------------------------------------------------------------

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
}

export function NotFoundState({
  title = "Not found",
  description = "The item you are looking for does not exist or may have been removed.",
  backLabel = "Go back",
  onBack,
  className = "",
}: NotFoundStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 gap-4",
        className,
      ].join(" ")}
    >
      <div
        className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#94a3b8]"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-[#0f172a]">{title}</h3>
        <p className="mt-1.5 text-sm text-[#64748b]">{description}</p>
      </div>
      {onBack && (
        <Button variant="outline" size="sm" onClick={onBack}>
          {backLabel}
        </Button>
      )}
    </div>
  );
}
