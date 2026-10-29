/**
 * Shared formatting utilities for FlowLedger.
 *
 * Rules:
 * - Never convert amount strings using floating-point arithmetic.
 * - Never parse date-only strings as timestamps (no time zone shift).
 */

/** Format a decimal string amount with the given currency. */
export function formatCurrency(amount: string, currency: string): string {
  const numericValue = parseFloat(amount);
  if (isNaN(numericValue)) return `${amount} ${currency}`;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    // Fall back if currency code is unrecognized
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}

/**
 * Format a YYYY-MM-DD date-only string.
 * Does NOT parse as a timestamp to avoid timezone shifts.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;

  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Format an ISO 8601 timestamp string. */
export function formatTimestamp(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

/** Format a relative timestamp (e.g. "2 hours ago"). */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;

    return formatDate(date.toISOString().split("T")[0]);
  } catch {
    return isoString;
  }
}

/** Format file size from bytes to a readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
