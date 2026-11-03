"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { ApprovalsIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useInvoicesList } from "@/services/mock/useInvoiceStore";

export function ApprovalsInboxView() {
  const allInvoices = useInvoicesList();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter only PENDING_APPROVAL
  const pendingInvoices = useMemo(() => {
    let list = allInvoices.filter((i) => i.status === "PENDING_APPROVAL");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (inv) =>
          inv.supplierName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q)
      );
    }

    list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return list;
  }, [allInvoices, search]);

  const totalItems = pendingInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return pendingInvoices.slice(start, start + pageSize);
  }, [pendingInvoices, page, pageSize]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Approvals"
        description={
          totalItems > 0
            ? `${totalItems} invoice${totalItems === 1 ? "" : "s"} awaiting your decision.`
            : "No invoices currently require approval."
        }
      />

      <Card className="flex flex-col gap-4">
        {/* Header & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#0f172a]">
              Pending Approval
            </h2>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold bg-[#0f766e] text-white">
              {totalItems}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search pending invoices…"
              className="w-full h-8 pl-8 pr-3 rounded-md text-xs border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:outline-2 focus-visible:outline-[#0d9488] focus-visible:bg-white"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            title="All caught up!"
            description={
              search.trim()
                ? "No pending invoices match your search query."
                : "No invoices currently require your review or approval."
            }
            icon={<ApprovalsIcon size={36} />}
            className="py-12"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-[#e2e8f0]">
              <table className="w-full text-sm" aria-label="Pending approval invoices">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
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
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[#475569] uppercase tracking-wide">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedItems.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[#0f172a]">
                        <Link
                          href={`/approvals/${invoice.id}`}
                          className="hover:text-[#0f766e] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
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
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/approvals/${invoice.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#0f766e] hover:text-[#115e59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                        >
                          Review
                          <ChevronRightIcon size={12} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="sm:hidden flex flex-col gap-3" role="list">
              {paginatedItems.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/approvals/${invoice.id}`}
                    className="block bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 hover:border-[#0f766e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-[#0f172a] truncate">
                        {invoice.supplierName}
                      </p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-[#64748b] font-mono">
                        {invoice.invoiceNumber}
                      </p>
                      <span className="font-semibold text-[#0f172a] tabular-nums text-sm">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      {formatDate(invoice.invoiceDate)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination if multiple pages */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                <p className="text-xs text-[#64748b]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
