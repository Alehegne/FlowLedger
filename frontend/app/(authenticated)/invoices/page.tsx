import Link from "next/link";
import { MOCK_INVOICES } from "@/lib/mock/fixtures";
import { PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export const metadata = {
  title: "Invoices — FlowLedger",
};

export default function InvoicesPage() {
  const invoices = MOCK_INVOICES;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Browse, search and manage all invoices."
        action={
          <Link href="/invoices/new">
            <Button variant="primary" size="md">
              <PlusIcon size={16} aria-hidden />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Placeholder notice */}
      <div className="rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 text-sm text-[#475569]">
        <strong className="text-[#0f172a]">Phase placeholder:</strong> Full
        search, filtering, sorting and pagination will be implemented in the
        next phase. Showing mock data.
      </div>

      {/* Desktop table */}
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
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-[#f8fafc] transition-colors group"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0f172a]">{invoice.supplierName}</p>
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
                    className="text-xs font-medium text-[#0f766e] hover:text-[#115e59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="sm:hidden flex flex-col gap-3" role="list" aria-label="Invoice list">
        {invoices.map((invoice) => (
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
              <div className="flex items-center justify-between mt-2">
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
    </div>
  );
}
