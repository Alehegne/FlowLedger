"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { useInvoicesList } from "@/services/mock/useInvoiceStore";
import { PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import {
  PlusIcon,
  InvoiceIcon,
  ChevronRightIcon,
} from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { InvoiceStatus } from "@/types/invoice";

const STATUS_FILTERS: { label: string; value: InvoiceStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function InvoiceListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Reactive store subscription
  const allInvoices = useInvoicesList();

  // URL state
  const rawStatus = searchParams.get("status") || "ALL";
  const statusFilter: InvoiceStatus | "ALL" = STATUS_FILTERS.some(
    (f) => f.value === rawStatus
  )
    ? (rawStatus as InvoiceStatus | "ALL")
    : "ALL";

  const rawSearch = searchParams.get("search") || "";
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const rawSize = parseInt(searchParams.get("size") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "invoiceDate";
  const sortDirection = (searchParams.get("sortDirection") || "desc") as
    | "asc"
    | "desc";

  // Local state for immediate typing responsiveness
  const [prevRawSearch, setPrevRawSearch] = useState(rawSearch);
  const [searchInput, setSearchInput] = useState(rawSearch);

  // Sync local search when URL changes without an effect
  if (rawSearch !== prevRawSearch) {
    setPrevRawSearch(rawSearch);
    setSearchInput(rawSearch);
  }

  function updateQuery(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "status" && value === "ALL")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  // Filter and sort items locally over reactive store snapshot
  const filteredAndSorted = useMemo(() => {
    let list = [...allInvoices];

    // Status filter
    if (statusFilter !== "ALL") {
      list = list.filter((inv) => inv.status === statusFilter);
    }

    // Text search
    if (rawSearch.trim()) {
      const q = rawSearch.trim().toLowerCase();
      list = list.filter(
        (inv) =>
          inv.supplierName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q)
      );
    }

    // Sorting
    const mult = sortDirection === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortBy) {
        case "amount": {
          const numA = parseFloat(a.amount) || 0;
          const numB = parseFloat(b.amount) || 0;
          return (numA - numB) * mult;
        }
        case "supplierName":
          return a.supplierName.localeCompare(b.supplierName) * mult;
        case "invoiceNumber":
          return a.invoiceNumber.localeCompare(b.invoiceNumber) * mult;
        case "status":
          return a.status.localeCompare(b.status) * mult;
        case "invoiceDate":
        default:
          return a.invoiceDate.localeCompare(b.invoiceDate) * mult;
      }
    });

    return list;
  }, [allInvoices, statusFilter, rawSearch, sortBy, sortDirection]);

  // Pagination calculation
  const totalItems = filteredAndSorted.length;
  const pageSize = [5, 10, 20].includes(rawSize) ? rawSize : 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: "1" });
  }

  function handleStatusChange(status: InvoiceStatus | "ALL") {
    updateQuery({
      status: status === "ALL" ? null : status,
      page: "1",
    });
  }

  function handleClearFilters() {
    setSearchInput("");
    updateQuery({
      search: null,
      status: null,
      page: "1",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Browse, search and manage all supplier invoices."
        action={
          <Link href="/invoices/new">
            <Button variant="primary" size="md">
              <PlusIcon size={16} aria-hidden />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_0_rgb(0_0_0/0.05)]">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="tablist">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleStatusChange(f.value)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]",
                  isActive
                    ? "bg-[#0f766e] text-white"
                    : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] hover:text-[#0f172a]",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md"
          >
            <div className="relative w-full">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onBlur={() => {
                  if (searchInput.trim() !== rawSearch) {
                    updateQuery({ search: searchInput.trim() || null, page: "1" });
                  }
                }}
                placeholder="Search by supplier or invoice #…"
                className="w-full h-9 pl-9 pr-3 rounded-md text-sm border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:outline-2 focus-visible:outline-[#0d9488] focus-visible:bg-white"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {rawSearch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateQuery({ search: null, page: "1" });
                }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-xs text-[#64748b] font-medium whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split("-");
                updateQuery({ sortBy: sb, sortDirection: sd });
              }}
              className="h-9 px-2.5 rounded-md text-xs border border-[#e2e8f0] bg-white text-[#0f172a] focus-visible:outline-2 focus-visible:outline-[#0d9488]"
            >
              <option value="invoiceDate-desc">Date (Newest)</option>
              <option value="invoiceDate-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (Highest)</option>
              <option value="amount-asc">Amount (Lowest)</option>
              <option value="supplierName-asc">Supplier (A–Z)</option>
              <option value="supplierName-desc">Supplier (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results content */}
      {allInvoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to get started."
          icon={<InvoiceIcon size={36} />}
          actionLabel="New Invoice"
          onAction={() => router.push("/invoices/new")}
          className="bg-white border border-[#e2e8f0] rounded-xl"
        />
      ) : filteredAndSorted.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center flex flex-col items-center gap-3">
          <p className="text-base font-semibold text-[#0f172a]">
            No invoices match your filters
          </p>
          <p className="text-sm text-[#64748b] max-w-sm">
            Try adjusting your search query or selecting a different status.
          </p>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
            <table className="w-full text-sm" aria-label="Invoice list">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    Supplier
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[#475569] uppercase tracking-wide">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {paginatedItems.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-[#f8fafc] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-[#0f172a] hover:text-[#0f766e] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                      >
                        {invoice.supplierName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#475569] font-mono text-xs">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-[#475569]">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0f172a] tabular-nums">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#0f766e] hover:text-[#115e59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                      >
                        View
                        <ChevronRightIcon size={12} aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <ul className="sm:hidden flex flex-col gap-3" role="list" aria-label="Invoice list">
            {paginatedItems.map((invoice) => (
              <li key={invoice.id}>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="block bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)] hover:border-[#0f766e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0f172a] truncate">
                        {invoice.supplierName}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5 font-mono">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f8fafc]">
                    <span className="text-xs text-[#64748b]">
                      {formatDate(invoice.invoiceDate)}
                    </span>
                    <span className="font-semibold text-[#0f172a] tabular-nums">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-3">
            <p className="text-xs text-[#64748b]">
              Showing{" "}
              <strong className="text-[#0f172a]">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#0f172a]">
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-[#0f172a]">{totalItems}</strong> invoices
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateQuery({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-[#475569] px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateQuery({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
