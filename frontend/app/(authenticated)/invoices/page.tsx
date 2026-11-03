import { Suspense } from "react";
import { InvoiceListView } from "@/features/invoices/InvoiceListView";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Invoices — FlowLedger",
};

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesLoadingSkeleton />}>
      <InvoiceListView />
    </Suspense>
  );
}

function InvoicesLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading invoices…">
      <div className="h-8 w-48 bg-[#e2e8f0] rounded animate-pulse" />
      <div className="h-20 bg-white rounded-xl border border-[#e2e8f0] animate-pulse" />
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
