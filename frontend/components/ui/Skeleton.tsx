import React from "react";

// ---------------------------------------------------------------------------
// Skeleton — shimmering placeholder for loading states
// ---------------------------------------------------------------------------

export interface SkeletonProps {
  className?: string;
  /** Height in Tailwind class format, e.g. "h-4" */
  height?: string;
  /** Width in Tailwind class format, e.g. "w-32" */
  width?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse bg-[#e2e8f0]",
        height,
        width,
        roundedMap[rounded],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard — full card placeholder
// ---------------------------------------------------------------------------

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "bg-white border border-[#e2e8f0] rounded-xl p-5",
        "shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3">
        <Skeleton height="h-4" width="w-2/3" />
        <Skeleton height="h-7" width="w-1/2" />
        <Skeleton height="h-3" width="w-3/4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonRow — table row placeholder
// ---------------------------------------------------------------------------

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height="h-4" width={i === 0 ? "w-32" : "w-20"} />
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// SkeletonText — paragraph lines
// ---------------------------------------------------------------------------

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}
