import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_INVOICES } from "@/lib/mock/fixtures";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, FileIcon } from "@/components/ui/Icons";
import { formatCurrency, formatDate, formatTimestamp } from "@/lib/utils/format";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = MOCK_INVOICES.find((i) => i.id === id);
  return {
    title: invoice
      ? `${invoice.supplierName} · ${invoice.invoiceNumber} — FlowLedger`
      : "Invoice — FlowLedger",
  };
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = MOCK_INVOICES.find((i) => i.id === id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back navigation */}
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Invoices
      </Link>

      <PageHeader
        title={invoice.supplierName}
        description={`Invoice ${invoice.invoiceNumber}`}
        action={<StatusBadge status={invoice.status} />}
      />

      {/* Invoice details */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-4">Invoice Details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Invoice #</dt>
            <dd className="mt-1 text-sm font-mono text-[#0f172a]">{invoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Amount</dt>
            <dd className="mt-1 text-sm font-bold text-[#0f172a] tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Status</dt>
            <dd className="mt-1"><StatusBadge status={invoice.status} /></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Invoice Date</dt>
            <dd className="mt-1 text-sm text-[#0f172a]">{formatDate(invoice.invoiceDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Due Date</dt>
            <dd className="mt-1 text-sm text-[#0f172a]">
              {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Currency</dt>
            <dd className="mt-1 text-sm text-[#0f172a]">{invoice.currency}</dd>
          </div>
          {invoice.description && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Description</dt>
              <dd className="mt-1 text-sm text-[#0f172a]">{invoice.description}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Created</dt>
            <dd className="mt-1 text-sm text-[#475569]">{formatTimestamp(invoice.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Last Updated</dt>
            <dd className="mt-1 text-sm text-[#475569]">{formatTimestamp(invoice.updatedAt)}</dd>
          </div>
        </dl>
      </Card>

      {/* Document placeholder */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">Supporting Document</h2>
        <div className="flex items-center gap-3 p-4 border border-dashed border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <FileIcon size={24} className="text-[#94a3b8] shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm text-[#475569]">No document uploaded</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Document upload will be available in the next implementation phase.
            </p>
          </div>
        </div>
      </Card>

      {/* Activity placeholder */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">Activity</h2>
        <p className="text-sm text-[#64748b]">
          Activity timeline will be implemented with the backend integration.
        </p>
      </Card>

      {/* Contextual actions */}
      {invoice.status === "PENDING_APPROVAL" && (
        <div className="flex gap-3">
          <Link href={`/approvals/${invoice.id}`}>
            <Button variant="primary" size="md">Review &amp; Approve</Button>
          </Link>
        </div>
      )}
      {invoice.status === "DRAFT" && (
        <div className="flex gap-3">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="md">Edit Draft</Button>
          </Link>
          <Button variant="primary" size="md">Submit for Approval</Button>
        </div>
      )}
    </div>
  );
}
