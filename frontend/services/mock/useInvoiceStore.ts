"use client";

import { useSyncExternalStore, useMemo, useEffect } from "react";
import { invoiceStore } from "@/services/invoiceStore";
import type { Invoice, DashboardSummary } from "@/types/invoice";

/**
 * React hook that subscribes to invoiceStore mutations and backend API data.
 * Returns the current list of invoices and automatically re-renders
 * any component when store mutations occur.
 */
export function useInvoicesList(): Invoice[] {
  const snapshot = useSyncExternalStore(
    invoiceStore.subscribe,
    invoiceStore.getSnapshot,
    invoiceStore.getServerSnapshot
  );
  return snapshot.invoices;
}

/**
 * Returns the reactive count of invoices in PENDING_APPROVAL status.
 * Re-renders whenever an invoice is submitted, approved, or rejected.
 */
export function usePendingApprovalsCount(): number {
  const snapshot = useSyncExternalStore(
    invoiceStore.subscribe,
    invoiceStore.getSnapshot,
    invoiceStore.getServerSnapshot
  );
  return useMemo(
    () => snapshot.invoices.filter((i) => i.status === "PENDING_APPROVAL").length,
    [snapshot]
  );
}

/**
 * Returns reactive dashboard summary metrics and recent invoices.
 */
export function useDashboardSummary(): DashboardSummary {
  const snapshot = useSyncExternalStore(
    invoiceStore.subscribe,
    invoiceStore.getSnapshot,
    invoiceStore.getServerSnapshot
  );

  return useMemo(() => {
    const invoices = snapshot.invoices;
    return {
      totalInvoices: invoices.length,
      pendingApprovals: invoices.filter((i) => i.status === "PENDING_APPROVAL").length,
      approvedInvoices: invoices.filter((i) => i.status === "APPROVED").length,
      rejectedInvoices: invoices.filter((i) => i.status === "REJECTED").length,
      draftInvoices: invoices.filter((i) => i.status === "DRAFT").length,
      recentInvoices: [...invoices]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
      pendingApprovalInvoices: invoices.filter(
        (i) => i.status === "PENDING_APPROVAL"
      ),
    };
  }, [snapshot]);
}

/**
 * Returns a specific invoice by ID, re-rendering if its status or details change.
 */
export function useInvoice(id: string): Invoice | null {
  const snapshot = useSyncExternalStore(
    invoiceStore.subscribe,
    invoiceStore.getSnapshot,
    invoiceStore.getServerSnapshot
  );

  useEffect(() => {
    if (id && !snapshot.invoices.some((i) => i.id === id)) {
      invoiceStore.getInvoiceById(id);
    }
  }, [id, snapshot.invoices]);

  return useMemo(
    () => snapshot.invoices.find((i) => i.id === id) || null,
    [snapshot, id]
  );
}
