import { getStatusConfig } from "@/lib/utils/status";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Renders an invoice status as a readable pill badge.
 * Color reinforces meaning but the text label is always visible.
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        "whitespace-nowrap select-none",
        config.fgClass,
        config.bgClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={config.ariaLabel}
    >
      {/* Small dot provides a non-color shape signal */}
      <span
        aria-hidden="true"
        className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"
      />
      {config.label}
    </span>
  );
}
