import Link from "next/link";
import { getMockDashboardSummary } from "@/lib/mock/fixtures";
import { MetricCard, PageHeader, SectionHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import {
  InvoiceIcon,
  ApprovalsIcon,
  CheckIcon,
  AlertCircleIcon,
  PlusIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export const metadata = {
  title: "Dashboard — FlowLedger",
};

export default function DashboardPage() {
  // Prototype: data is loaded synchronously from mock fixtures.
  // Replace with an async service call when the backend is available.
  const summary = getMockDashboardSummary();

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back, Abebe. Here's what needs your attention today."
        action={
          <Link href="/invoices/new">
            <Button variant="primary" size="md">
              <PlusIcon size={16} aria-hidden />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Prototype data notice */}
      <div
        role="note"
        aria-label="Prototype data notice"
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#fef3c7] border border-[#fde68a] text-sm text-[#92400e]"
      >
        <AlertCircleIcon size={16} className="shrink-0" />
        <span>
          <strong>Prototype:</strong> This dashboard shows representative mock
          data. Real data will be loaded from the backend API.
        </span>
      </div>

      {/* Summary metric cards */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Invoice summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/invoices" className="group focus-visible:outline-none">
            <MetricCard
              label="Total Invoices"
              value={summary.totalInvoices}
              icon={<InvoiceIcon size={22} />}
              className="group-hover:border-[#0f766e] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0d9488] transition-colors"
            />
          </Link>

          <Link
            href="/approvals"
            className="group focus-visible:outline-none"
          >
            <MetricCard
              label="Pending Approvals"
              value={summary.pendingApprovals}
              description={
                summary.pendingApprovals > 0
                  ? "Require attention"
                  : "All caught up"
              }
              icon={<ClockIcon size={22} />}
              className="group-hover:border-[#0f766e] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0d9488] transition-colors"
            />
          </Link>

          <Link
            href="/invoices?status=APPROVED"
            className="group focus-visible:outline-none"
          >
            <MetricCard
              label="Approved"
              value={summary.approvedInvoices}
              icon={<CheckIcon size={22} />}
              className="group-hover:border-[#0f766e] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0d9488] transition-colors"
            />
          </Link>

          <Link
            href="/invoices?status=REJECTED"
            className="group focus-visible:outline-none"
          >
            <MetricCard
              label="Rejected"
              value={summary.rejectedInvoices}
              icon={<AlertCircleIcon size={22} />}
              className="group-hover:border-[#0f766e] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#0d9488] transition-colors"
            />
          </Link>
        </div>
      </section>

      {/* Two-column grid: pending approvals + recent invoices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Pending approvals */}
        <section aria-labelledby="pending-heading">
          <Card className="flex flex-col gap-4">
            <SectionHeader
              title="Pending Approvals"
              action={
                <Link
                  href="/approvals"
                  className="text-sm font-medium text-[#0f766e] hover:text-[#115e59] flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                >
                  View all
                  <ChevronRightIcon size={14} aria-hidden />
                </Link>
              }
            />

            {summary.pendingApprovalInvoices.length === 0 ? (
              <EmptyState
                title="No pending approvals"
                description="All invoices have been reviewed."
                icon={<ApprovalsIcon size={32} />}
                className="py-8"
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[#f1f5f9]" role="list">
                {summary.pendingApprovalInvoices.slice(0, 4).map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/approvals/${invoice.id}`}
                      className="flex items-center justify-between gap-3 py-3 px-1 rounded-lg hover:bg-[#f8fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0f172a] truncate group-hover:text-[#0f766e] transition-colors">
                          {invoice.supplierName}
                        </p>
                        <p className="text-xs text-[#64748b] truncate">
                          {invoice.invoiceNumber} · {formatDate(invoice.invoiceDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-[#0f172a] tabular-nums">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                        <ChevronRightIcon size={14} className="text-[#94a3b8]" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Recent invoices */}
        <section aria-labelledby="recent-heading">
          <Card className="flex flex-col gap-4">
            <SectionHeader
              title="Recent Invoices"
              action={
                <Link
                  href="/invoices"
                  className="text-sm font-medium text-[#0f766e] hover:text-[#115e59] flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                >
                  View all
                  <ChevronRightIcon size={14} aria-hidden />
                </Link>
              }
            />

            {summary.recentInvoices.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                description="Create your first invoice to get started."
                icon={<InvoiceIcon size={32} />}
                actionLabel="New Invoice"
                className="py-8"
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[#f1f5f9]" role="list">
                {summary.recentInvoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="flex items-start justify-between gap-3 py-3 px-1 rounded-lg hover:bg-[#f8fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0f172a] truncate group-hover:text-[#0f766e] transition-colors">
                          {invoice.supplierName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-[#64748b] truncate">
                            {invoice.invoiceNumber}
                          </p>
                          <span className="text-[#cbd5e1] text-xs">·</span>
                          <p className="text-xs text-[#94a3b8] shrink-0">
                            {formatDate(invoice.updatedAt.split("T")[0])}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-semibold text-[#0f172a] tabular-nums">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                        <StatusBadge status={invoice.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-heading">
        <Card>
          <h2
            id="quick-actions-heading"
            className="text-base font-semibold text-[#0f172a] mb-4"
          >
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/invoices/new">
              <Button variant="primary" size="sm">
                <PlusIcon size={15} aria-hidden />
                New Invoice
              </Button>
            </Link>
            <Link href="/approvals">
              <Button variant="outline" size="sm">
                <ApprovalsIcon size={15} aria-hidden />
                Review Approvals
                {summary.pendingApprovals > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold bg-[#0f766e] text-white">
                    {summary.pendingApprovals}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                <InvoiceIcon size={15} aria-hidden />
                All Invoices
              </Button>
            </Link>
            <Link href="/settings/team">
              <Button variant="ghost" size="sm">
                Manage Team
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
