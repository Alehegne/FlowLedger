import React from "react";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  /** Make the card a clickable element */
  onClick?: () => void;
  as?: "div" | "article" | "section" | "li";
}

export function Card({
  className = "",
  children,
  onClick,
  as: Tag = "div",
}: CardProps) {
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
    : "";

  return (
    <Tag
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        "bg-white border border-[#e2e8f0] rounded-xl p-5",
        "shadow-[0_1px_3px_0_rgb(0_0_0/0.07),0_1px_2px_-1px_rgb(0_0_0/0.05)]",
        interactiveClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// MetricCard — dashboard summary cards
// ---------------------------------------------------------------------------

export interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  description,
  onClick,
  icon,
  className = "",
}: MetricCardProps) {
  return (
    <Card onClick={onClick} className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#475569] truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#0f172a] tabular-nums">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-[#64748b]">{description}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 text-[#0f766e]" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PageHeader
// ---------------------------------------------------------------------------

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={[
        "flex flex-wrap items-start justify-between gap-4",
        className,
      ].join(" ")}
    >
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[#475569]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

export interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={["flex items-center justify-between gap-4", className].join(
        " "
      )}
    >
      <h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}
