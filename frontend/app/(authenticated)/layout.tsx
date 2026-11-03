"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
    }
  }, [loading, session, router]);

  if (loading) {
    return <FullPageSkeleton />;
  }

  if (!session) {
    return <FullPageSkeleton />;
  }

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
