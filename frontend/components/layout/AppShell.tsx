"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * Authenticated application shell.
 *
 * Desktop (lg+):  persistent left sidebar + top header
 * Tablet/mobile:  collapsible drawer navigation triggered from header
 *
 * All client-router hook components are wrapped in <Suspense> so that
 * server-rendered pages with dynamic params can still prerender.
 */
export function AppShell({ children, pageTitle }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Prototype session — swap with real session context in production
  const session = {
    userName: "Abebe Girma",
    userEmail: "abebe@acme.co",
    organizationName: "Acme Trading Co.",
    pendingApprovals: 3,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Desktop sidebar — hidden below lg, wrapped in Suspense for usePathname */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar
            pendingApprovals={session.pendingApprovals}
            organizationName={session.organizationName}
          />
        </Suspense>
      </div>

      {/* Mobile / tablet drawer, also wrapped in Suspense for usePathname */}
      <Suspense fallback={null}>
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          pendingApprovals={session.pendingApprovals}
        />
      </Suspense>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          pageTitle={pageTitle}
          userName={session.userName}
          userEmail={session.userEmail}
          organizationName={session.organizationName}
          onMenuToggle={() => setMobileNavOpen(true)}
        />

        {/* Scrollable page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Minimal sidebar placeholder shown while Suspense resolves */
function SidebarSkeleton() {
  return (
    <aside
      className="flex flex-col h-full w-60 bg-white border-r border-[#e2e8f0]"
      aria-hidden="true"
    >
      <div className="px-5 py-4 border-b border-[#e2e8f0]">
        <div className="h-7 w-32 bg-[#f1f5f9] rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-1 px-3 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 rounded-lg bg-[#f1f5f9] animate-pulse" />
        ))}
      </div>
    </aside>
  );
}
