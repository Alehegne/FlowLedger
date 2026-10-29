import type { InvoiceStatus } from "@/types/invoice";

export interface StatusConfig {
  label: string;
  /** Tailwind classes for foreground color */
  fgClass: string;
  /** Tailwind classes for background color */
  bgClass: string;
  /** Short text label for screen readers when status uses an icon */
  ariaLabel: string;
}

const STATUS_MAP: Record<InvoiceStatus, StatusConfig> = {
  DRAFT: {
    label: "Draft",
    fgClass: "text-[#475569]",
    bgClass: "bg-[#f1f5f9]",
    ariaLabel: "Draft — work in progress",
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    fgClass: "text-[#92400e]",
    bgClass: "bg-[#fef3c7]",
    ariaLabel: "Pending Approval — awaiting decision",
  },
  APPROVED: {
    label: "Approved",
    fgClass: "text-[#166534]",
    bgClass: "bg-[#dcfce7]",
    ariaLabel: "Approved",
  },
  REJECTED: {
    label: "Rejected",
    fgClass: "text-[#991b1b]",
    bgClass: "bg-[#fee2e2]",
    ariaLabel: "Rejected",
  },
  CANCELLED: {
    label: "Cancelled",
    fgClass: "text-[#475569]",
    bgClass: "bg-[#e2e8f0]",
    ariaLabel: "Cancelled",
  },
};

const FALLBACK_STATUS: StatusConfig = {
  label: "Unknown",
  fgClass: "text-[#475569]",
  bgClass: "bg-[#f1f5f9]",
  ariaLabel: "Unknown status",
};

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_MAP[status as InvoiceStatus] ?? FALLBACK_STATUS;
}

export function getStatusLabel(status: string): string {
  return getStatusConfig(status).label;
}

export function isKnownStatus(status: string): status is InvoiceStatus {
  return status in STATUS_MAP;
}
