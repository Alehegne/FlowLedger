"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  InvoiceIcon,
  ApprovalsIcon,
  TeamIcon,
  SettingsIcon,
  XIcon,
} from "@/components/ui/Icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon size={20} /> },
  { href: "/invoices", label: "Invoices", icon: <InvoiceIcon size={20} /> },
  { href: "/approvals", label: "Approvals", icon: <ApprovalsIcon size={20} /> },
  { href: "/settings/team", label: "Team", icon: <TeamIcon size={20} /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon size={20} /> },
];

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  pendingApprovals?: number;
}

export function MobileNav({
  isOpen,
  onClose,
  pendingApprovals = 0,
}: MobileNavProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const itemsWithBadges = NAV_ITEMS.map((item) =>
    item.href === "/approvals" ? { ...item, badge: pendingApprovals } : item
  );

  function isActive(href: string) {
    if (href === "/settings" && pathname.startsWith("/settings/team")) return false;
    if (href === "/settings" && pathname.startsWith("/settings")) return true;
    if (href === "/settings/team") return pathname.startsWith("/settings/team");
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-[0_0_32px_0_rgb(0_0_0/0.18)] flex flex-col lg:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#0f766e]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 11V6l5-4 5 4v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <rect x="5" y="7" width="4" height="5" fill="white" fillOpacity="0.6" />
              </svg>
            </span>
            <span className="font-bold text-[#0f172a]">FlowLedger</span>
          </Link>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-md text-[#475569] hover:bg-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="flex flex-col gap-0.5" role="list">
            {itemsWithBadges.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                      "transition-colors duration-100",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]",
                      active
                        ? "bg-[#ccfbf1] text-[#0f766e]"
                        : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
                    ].join(" ")}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-[#0f766e] text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
