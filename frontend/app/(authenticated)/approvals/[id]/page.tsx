"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, Textarea } from "@/components/ui/Input";
import { NotFoundState } from "@/components/ui/States";
import {
  ArrowLeftIcon,
  CheckIcon,
  AlertCircleIcon,
} from "@/components/ui/Icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useInvoice } from "@/services/mock/useInvoiceStore";
import { approvalService } from "@/services";
import { validateRejectionReason } from "@/lib/utils/validation";

type DialogState = "none" | "approve" | "reject";

export default function ApprovalReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoice = useInvoice(params.id);

  const [dialog, setDialog] = useState<DialogState>("none");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);

  if (!invoice) {
    return (
      <NotFoundState
        title="Invoice not found"
        description="This invoice does not exist or may have been removed."
        backLabel="Back to Approvals"
        onBack={() => router.push("/approvals")}
      />
    );
  }

  // If already decided during this view
  if (decision) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center flex flex-col items-center gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            decision === "approved" ? "bg-[#dcfce7]" : "bg-[#fee2e2]"
          }`}
        >
          {decision === "approved" ? (
            <CheckIcon size={28} className="text-[#166534]" />
          ) : (
            <AlertCircleIcon size={28} className="text-[#991b1b]" />
          )}
        </div>
        <h2 className="text-xl font-bold text-[#0f172a]">
          Invoice {decision === "approved" ? "Approved" : "Rejected"}
        </h2>
        <p className="text-sm text-[#475569]">
          <strong>{invoice.supplierName}</strong> &middot;{" "}
          {invoice.invoiceNumber}
          <br />
          <span className="text-xs text-[#0f766e]">
            Decision recorded in store &mdash; queues and metrics updated
          </span>
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/approvals">
            <Button variant="primary">Back to Approvals</Button>
          </Link>
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="outline">View Invoice</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If invoice is already in a non-pending status
  if (invoice.status !== "PENDING_APPROVAL") {
    return (
      <div className="max-w-2xl flex flex-col gap-6">
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
        >
          <ArrowLeftIcon size={16} aria-hidden />
          Back to Approvals
        </Link>
        <div className="rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] px-6 py-8 text-center">
          <p className="text-sm text-[#475569]">
            This invoice is not currently pending approval.
          </p>
          <div className="mt-3">
            <StatusBadge status={invoice.status} />
          </div>
          <div className="mt-4">
            <Link href={`/invoices/${invoice.id}`}>
              <Button variant="outline" size="sm">
                View Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleApprove() {
    setIsProcessing(true);
    setActionError("");

    try {
      await approvalService.approve(invoice!.id);
      setIsProcessing(false);
      setDialog("none");
      setDecision("approved");
    } catch (err: unknown) {
      setIsProcessing(false);
      setActionError(
        err instanceof Error ? err.message : "Failed to approve invoice."
      );
    }
  }

  async function handleReject() {
    const reasonValidation = validateRejectionReason(rejectReason);
    if (!reasonValidation.isValid) {
      setRejectError(reasonValidation.error || "Please provide a valid rejection reason.");
      return;
    }

    setRejectError("");
    setIsProcessing(true);
    setActionError("");

    try {
      await approvalService.reject(invoice!.id, rejectReason.trim());
      setIsProcessing(false);
      setDialog("none");
      setDecision("rejected");
    } catch (err: unknown) {
      setIsProcessing(false);
      setActionError(
        err instanceof Error ? err.message : "Failed to reject invoice."
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Approvals
      </Link>

      <PageHeader
        title="Review Invoice"
        description={`${invoice.supplierName} · ${invoice.invoiceNumber}`}
        action={<StatusBadge status={invoice.status} />}
      />

      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-[#fee2e2] border border-[#fecaca] px-4 py-3 text-sm text-[#991b1b]"
        >
          <AlertCircleIcon size={18} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
              Amount
            </dt>
            <dd className="mt-1 text-lg font-bold text-[#0f172a] tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
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
        </dl>
      </Card>

      {/* Decision buttons */}
      {dialog === "none" && (
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setDialog("approve")}>
            <CheckIcon size={15} aria-hidden />
            Approve
          </Button>
          <Button variant="destructive" onClick={() => setDialog("reject")}>
            <AlertCircleIcon size={15} aria-hidden />
            Reject
          </Button>
        </div>
      )}

      {/* Approve confirmation dialog panel */}
      {dialog === "approve" && (
        <Card className="border-[#bbf7d0]">
          <h3 className="text-sm font-semibold text-[#166534] mb-2">
            Confirm Approval
          </h3>
          <p className="text-sm text-[#475569] mb-4">
            You are about to approve the invoice for{" "}
            <strong>{invoice.supplierName}</strong> &mdash;{" "}
            <strong>
              {formatCurrency(invoice.amount, invoice.currency)}
            </strong>
            .
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              loading={isProcessing}
              onClick={handleApprove}
            >
              Confirm Approval
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDialog("none")}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Reject dialog panel */}
      {dialog === "reject" && (
        <Card className="border-[#fecaca]">
          <h3 className="text-sm font-semibold text-[#991b1b] mb-2">
            Reject Invoice
          </h3>
          <p className="text-sm text-[#475569] mb-4">
            Provide a reason for rejecting{" "}
            <strong>{invoice.invoiceNumber}</strong>. The reason will be
            recorded in the invoice history.
          </p>
          <div className="mb-4">
            <FormField
              label="Rejection Reason"
              htmlFor="rejectReason"
              required
              error={rejectError || undefined}
            >
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                rows={3}
                placeholder="Explain why this invoice is being rejected…"
                error={!!rejectError}
              />
            </FormField>
          </div>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              loading={isProcessing}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDialog("none");
                setRejectReason("");
                setRejectError("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
