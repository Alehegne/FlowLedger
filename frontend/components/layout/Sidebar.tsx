"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  InvoiceIcon,
  ApprovalsIcon,
  TeamIcon,
  SettingsIcon,
} from "@/components/ui/Icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <DashboardIcon size={18} />,
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: <InvoiceIcon size={18} />,
  },
  {
    href: "/approvals",
    label: "Approvals",
    icon: <ApprovalsIcon size={18} />,
  },
  {
    href: "/settings/team",
    label: "Team",
    icon: <TeamIcon size={18} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <SettingsIcon size={18} />,
  },
];

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
}

function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={[
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
          "transition-colors duration-100",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]",
          isActive
            ? "bg-[#ccfbf1] text-[#0f766e]"
            : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
        ].join(" ")}
      >
        <span className="shrink-0">{item.icon}</span>
        <span className="truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className="ml-auto shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-[#0f766e] text-white"
            aria-label={`${item.badge} pending`}
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

export interface SidebarProps {
  pendingApprovals?: number;
  organizationName?: string;
}

export function Sidebar({
  pendingApprovals = 0,
  organizationName = "FlowLedger",
}: SidebarProps) {
  const pathname = usePathname();

  const itemsWithBadges = NAV_ITEMS.map((item) =>
    item.href === "/approvals"
      ? { ...item, badge: pendingApprovals }
      : item
  );

  function isActive(href: string) {
    if (href === "/settings" && pathname.startsWith("/settings/team")) {
      return false;
    }
    if (href === "/settings" && pathname.startsWith("/settings")) {
      return true;
    }
    if (href === "/settings/team") {
      return pathname.startsWith("/settings/team");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="flex flex-col h-full w-60 bg-white border-r border-[#e2e8f0] shrink-0"
      aria-label="Main navigation"
    >
      {/* Wordmark */}
      <div className="px-5 py-4 border-b border-[#e2e8f0]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#0f766e] shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 11V6l5-4 5 4v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"
                fill="white"
                fillOpacity="0.9"
              />
              <rect x="5" y="7" width="4" height="5" fill="white" fillOpacity="0.6" />
            </svg>
          </span>
          <span className="font-bold text-[#0f172a] text-base leading-none">
            FlowLedger
          </span>
        </Link>
        {organizationName !== "FlowLedger" && (
          <p className="mt-1 text-xs text-[#64748b] truncate pl-9">
            {organizationName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5" role="list">
          {itemsWithBadges.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer space */}
      <div className="px-3 py-3 border-t border-[#e2e8f0]">
        <p className="text-xs text-[#94a3b8] text-center">FlowLedger MVP</p>
      </div>
    </aside>
  );
}
