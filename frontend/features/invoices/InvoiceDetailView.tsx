"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { NotFoundState } from "@/components/ui/States";
import {
  ArrowLeftIcon,
  FileIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import {
  formatCurrency,
  formatDate,
  formatTimestamp,
} from "@/lib/utils/format";
import { useInvoice } from "@/services/mock/useInvoiceStore";
import { invoiceService } from "@/services";

export function InvoiceDetailView({ id }: { id: string }) {
  const router = useRouter();
  const invoice = useInvoice(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  if (!invoice) {
    return (
      <NotFoundState
        title="Invoice not found"
        description="The requested invoice does not exist or may have been removed."
        backLabel="Back to Invoices"
        onBack={() => router.push("/invoices")}
      />
    );
  }

  async function handleSubmitForApproval() {
    setIsSubmitting(true);
    setActionError("");
    setSuccessNotice("");

    try {
      await invoiceService.submitForApproval(invoice!.id);
      setSuccessNotice("Invoice submitted for approval successfully.");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to submit invoice for approval."
      );
    } finally {
      setIsSubmitting(false);
    }
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

      {successNotice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534]"
        >
          <CheckIcon size={18} className="shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-[#fee2e2] border border-[#fecaca] px-4 py-3 text-sm text-[#991b1b]"
        >
          <AlertCircleIcon size={18} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Rejection reason banner */}
      {invoice.status === "REJECTED" && invoice.rejectionReason && (
        <div
          role="note"
          aria-label="Rejection reason"
          className="rounded-lg bg-[#fee2e2] border border-[#fecaca] p-4 text-sm text-[#991b1b]"
        >
          <h2 className="font-semibold mb-1">Rejection Reason</h2>
          <p>{invoice.rejectionReason}</p>
        </div>
      )}

      {/* Details Card */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-4">
          Invoice Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Invoice #
            </dt>
            <dd className="mt-1 text-sm font-mono text-[#0f172a]">
              {invoice.invoiceNumber}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Amount
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#0f172a] tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Status
            </dt>
            <dd className="mt-1">
              <StatusBadge status={invoice.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Invoice Date
            </dt>
            <dd className="mt-1 text-sm text-[#0f172a]">
              {formatDate(invoice.invoiceDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Due Date
            </dt>
            <dd className="mt-1 text-sm text-[#0f172a]">
              {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Currency
            </dt>
            <dd className="mt-1 text-sm text-[#0f172a]">{invoice.currency}</dd>
          </div>
          {invoice.description && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                Description
              </dt>
              <dd className="mt-1 text-sm text-[#0f172a]">
                {invoice.description}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Created
            </dt>
            <dd className="mt-1 text-sm text-[#475569]">
              {formatTimestamp(invoice.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Last Updated
            </dt>
            <dd className="mt-1 text-sm text-[#475569]">
              {formatTimestamp(invoice.updatedAt)}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Supporting Document Placeholder */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">
          Supporting Document
        </h2>
        <div className="flex items-center gap-3 p-4 border border-dashed border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <FileIcon size={24} className="text-[#94a3b8] shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm text-[#475569]">No document uploaded</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              (Prototype: File storage is not connected in this phase.)
            </p>
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-[#0f172a] mb-3">
          Activity History
        </h2>
        {invoice.activities && invoice.activities.length > 0 ? (
          <ol className="relative border-l border-[#e2e8f0] ml-2.5 my-2">
            {invoice.activities.map((act) => (
              <li key={act.id} className="mb-4 ml-4 last:mb-0">
                <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-[#0f766e] ring-4 ring-white" />
                <p className="text-sm font-medium text-[#0f172a]">
                  {act.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#64748b]">
                  {act.actorName && <span>By {act.actorName}</span>}
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon size={12} aria-hidden />
                    {formatTimestamp(act.occurredAt)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-[#64748b]">
            Initial record created on {formatTimestamp(invoice.createdAt)}
          </p>
        )}
      </Card>

      {/* Contextual actions */}
      <div className="flex flex-wrap items-center gap-3">
        {invoice.status === "DRAFT" && (
          <>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="outline" size="md">
                Edit Draft
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              loading={isSubmitting}
              onClick={handleSubmitForApproval}
            >
              Submit for Approval
            </Button>
          </>
        )}

        {invoice.status === "PENDING_APPROVAL" && (
          <Link href={`/approvals/${invoice.id}`}>
            <Button variant="primary" size="md">
              Review &amp; Approve
            </Button>
          </Link>
        )}

        <Link href="/invoices">
          <Button variant="ghost" size="md">
            Back to Invoices
          </Button>
        </Link>
      </div>
    </div>
  );
}
