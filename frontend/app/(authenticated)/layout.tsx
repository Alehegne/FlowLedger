import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Authenticated application layout.
 * Wraps all authenticated routes with the sidebar + header shell.
 *
 * AppShell is a client component (uses useState); wrapping in Suspense
 * allows pages with dynamic params to still prerender their server content.
 *
 * NOTE: A production implementation would verify the session server-side
 * here and redirect to /sign-in when unauthenticated.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

function FullPageSkeleton() {
  return (
    <div
      className="flex h-screen items-center justify-center bg-[#f8fafc]"
      aria-label="Loading…"
    >
      <div className="w-8 h-8 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
