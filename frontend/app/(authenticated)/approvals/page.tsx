import Link from "next/link";
import { MOCK_INVOICES } from "@/lib/mock/fixtures";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { ApprovalsIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export const metadata = {
  title: "Approvals — FlowLedger",
};

export default function ApprovalsPage() {
  const pending = MOCK_INVOICES.filter(
    (i) => i.status === "PENDING_APPROVAL"
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Approvals"
        description={
          pending.length > 0
            ? `${pending.length} invoice${pending.length === 1 ? "" : "s"} awaiting your decision.`
            : "No invoices currently require approval."
        }
      />

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0f172a]">
            Pending Approval
          </h2>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold bg-[#0f766e] text-white">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="All invoices have been reviewed. Check back later."
            icon={<ApprovalsIcon size={32} />}
            className="py-8"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-[#e2e8f0]">
              <table className="w-full text-sm" aria-label="Pending approval invoices">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Supplier</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Invoice #</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Date</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[#475569] uppercase tracking-wide">Amount</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[#475569] uppercase tracking-wide"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {pending.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0f172a]">{invoice.supplierName}</td>
                      <td className="px-4 py-3 text-[#475569] font-mono text-xs">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-[#475569]">{formatDate(invoice.invoiceDate)}</td>
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
              {pending.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/approvals/${invoice.id}`}
                    className="block bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 hover:border-[#0f766e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-[#0f172a] truncate">{invoice.supplierName}</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-[#64748b] font-mono">{invoice.invoiceNumber}</p>
                      <span className="font-semibold text-[#0f172a] tabular-nums text-sm">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1">{formatDate(invoice.invoiceDate)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
