"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, LogOutIcon, SettingsIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { useAuth } from "@/features/auth/AuthContext";

export interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  organizationName?: string;
  onMenuToggle?: () => void;
}

export function Header({
  pageTitle,
  userName = "Demo User",
  userEmail = "demo@flowledger.app",
  organizationName,
  onMenuToggle,
}: HeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push("/sign-in");
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-[#e2e8f0] shrink-0">
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-[#475569] hover:bg-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {pageTitle && (
          <h2 className="text-sm font-semibold text-[#0f172a] truncate">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right: org context + user menu */}
      <div className="flex items-center gap-3">
        {organizationName && (
          <span className="hidden sm:block text-xs text-[#64748b] bg-[#f1f5f9] px-2.5 py-1 rounded-full truncate max-w-[160px]">
            {organizationName}
          </span>
        )}

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={triggerRef}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`User menu for ${userName}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0f766e] text-white text-xs font-semibold shrink-0">
              {initials}
            </span>
            <span className="hidden sm:block text-sm font-medium text-[#0f172a] max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDownIcon size={14} className="text-[#94a3b8] shrink-0" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="User actions"
              className="absolute right-0 mt-2 w-52 bg-white border border-[#e2e8f0] rounded-xl shadow-[0_4px_16px_0_rgb(0_0_0/0.12)] py-1 z-50"
            >
              {/* User info */}
              <div className="px-3 py-2 border-b border-[#f1f5f9]">
                <p className="text-sm font-medium text-[#0f172a] truncate">
                  {userName}
                </p>
                <p className="text-xs text-[#64748b] truncate">{userEmail}</p>
              </div>

              <Link
                href="/settings/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors focus-visible:outline-none focus-visible:bg-[#f1f5f9]"
              >
                <UserIcon size={16} aria-hidden />
                Profile
              </Link>

              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors focus-visible:outline-none focus-visible:bg-[#f1f5f9]"
              >
                <SettingsIcon size={16} aria-hidden />
                Settings
              </Link>

              <div className="border-t border-[#f1f5f9] mt-1 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#991b1b] hover:bg-[#fee2e2] transition-colors focus-visible:outline-none focus-visible:bg-[#fee2e2] w-full text-left"
                >
                  <LogOutIcon size={16} aria-hidden />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
