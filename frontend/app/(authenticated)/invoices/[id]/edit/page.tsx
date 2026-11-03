"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "@/components/ui/Input";
import { ArrowLeftIcon, AlertCircleIcon } from "@/components/ui/Icons";
import { NotFoundState } from "@/components/ui/States";
import { invoiceService } from "@/services";
import { useInvoice } from "@/services/mock/useInvoiceStore";
import { validateUpdateInvoiceInput } from "@/lib/utils/validation";
import type { Invoice } from "@/types/invoice";

export default function EditInvoiceDraftPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoice = useInvoice(params.id);

  if (!invoice) {
    return (
      <NotFoundState
        title="Invoice not found"
        description="The invoice you are trying to edit does not exist or may have been deleted."
        backLabel="Back to Invoices"
        onBack={() => router.push("/invoices")}
      />
    );
  }

  if (invoice.status !== "DRAFT") {
    return (
      <div className="max-w-xl flex flex-col gap-6">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] rounded w-fit"
        >
          <ArrowLeftIcon size={16} aria-hidden />
          Back to Invoice Details
        </Link>
        <div className="rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] p-8 text-center">
          <h2 className="text-base font-semibold text-[#0f172a] mb-2">
            Invoice cannot be edited
          </h2>
          <p className="text-sm text-[#64748b] mb-4">
            Only invoices in <strong>DRAFT</strong> status can be edited. This
            invoice is currently <strong>{invoice.status}</strong>.
          </p>
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="outline" size="sm">
              View Invoice
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <EditDraftForm key={invoice.id} invoice={invoice} />;
}

function EditDraftForm({ invoice }: { invoice: Invoice }) {
  const router = useRouter();

  const [supplierName, setSupplierName] = useState(invoice.supplierName);
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoiceDate);
  const [dueDate, setDueDate] = useState(invoice.dueDate || "");
  const [amount, setAmount] = useState(invoice.amount);
  const [currency, setCurrency] = useState(invoice.currency);
  const [description, setDescription] = useState(invoice.description || "");

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"save" | "submit" | null>(null);

  async function handleSave(submitImmediately: boolean) {
    const input = {
      supplierName: supplierName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: invoiceDate.trim(),
      dueDate: dueDate.trim() || null,
      amount: amount.trim(),
      currency: currency.trim().toUpperCase(),
      description: description.trim() || null,
    };

    const validation = validateUpdateInvoiceInput(input, invoiceDate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setActionType(submitImmediately ? "submit" : "save");

    try {
      await invoiceService.updateDraft(invoice.id, input);
      if (submitImmediately) {
        await invoiceService.submitForApproval(invoice.id);
      }
      router.push(`/invoices/${invoice.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setActionType(null);
      const msg = err instanceof Error ? err.message : "Failed to update draft.";
      setErrors((p) => ({ ...p, form: msg }));
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href={`/invoices/${invoice.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Invoice Details
      </Link>

      <PageHeader
        title="Edit Draft Invoice"
        description={`Editing draft ${invoice.invoiceNumber}`}
      />

      {errors.form && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-[#fee2e2] border border-[#fecaca] px-4 py-3 text-sm text-[#991b1b]"
        >
          <AlertCircleIcon size={18} className="shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(false);
        }}
        noValidate
        className="flex flex-col gap-6"
      >
        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-5">
            Supplier Information
          </h2>
          <FormField
            label="Supplier Name"
            htmlFor="supplierName"
            required
            error={errors.supplierName}
          >
            <Input
              id="supplierName"
              value={supplierName}
              onChange={(e) => {
                setSupplierName(e.target.value);
                if (errors.supplierName) {
                  setErrors((p) => ({ ...p, supplierName: undefined }));
                }
              }}
              error={!!errors.supplierName}
              required
            />
          </FormField>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-5">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Invoice Number"
              htmlFor="invoiceNumber"
              required
              error={errors.invoiceNumber}
            >
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  if (errors.invoiceNumber) {
                    setErrors((p) => ({ ...p, invoiceNumber: undefined }));
                  }
                }}
                error={!!errors.invoiceNumber}
                required
              />
            </FormField>

            <FormField
              label="Invoice Date"
              htmlFor="invoiceDate"
              required
              error={errors.invoiceDate}
            >
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value);
                  if (errors.invoiceDate) {
                    setErrors((p) => ({ ...p, invoiceDate: undefined }));
                  }
                }}
                error={!!errors.invoiceDate}
                required
              />
            </FormField>

            <FormField
              label="Amount"
              htmlFor="amount"
              required
              error={errors.amount}
            >
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors((p) => ({ ...p, amount: undefined }));
                  }
                }}
                error={!!errors.amount}
                required
              />
            </FormField>

            <FormField
              label="Currency"
              htmlFor="currency"
              required
              error={errors.currency}
            >
              <Select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="ETB">ETB — Ethiopian Birr</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </Select>
            </FormField>

            <FormField
              label="Due Date"
              htmlFor="dueDate"
              hint="Optional. Must be on or after invoice date"
              error={errors.dueDate}
            >
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) {
                    setErrors((p) => ({ ...p, dueDate: undefined }));
                  }
                }}
                error={!!errors.dueDate}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                label="Description"
                htmlFor="description"
                hint="Optional notes about this invoice"
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isSubmitting && actionType === "save"}
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
          >
            Save Changes
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            loading={isSubmitting && actionType === "submit"}
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
          >
            Submit for Approval
          </Button>

          <Link href={`/invoices/${invoice.id}`}>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
