"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "@/components/ui/Input";
import { ArrowLeftIcon, FileIcon, AlertCircleIcon } from "@/components/ui/Icons";
import { invoiceService } from "@/services";
import { validateCreateInvoiceInput } from "@/lib/utils/validation";

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETB");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"draft" | "submit" | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Check for duplicate invoice number on blur
  async function handleInvoiceNumberBlur() {
    if (!invoiceNumber.trim()) {
      setDuplicateWarning(false);
      return;
    }
    const isDup = await invoiceService.checkDuplicateInvoiceNumber(invoiceNumber);
    setDuplicateWarning(isDup);
  }

  async function handleAction(mode: "draft" | "submit") {
    const input = {
      supplierName: supplierName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: invoiceDate.trim(),
      dueDate: dueDate.trim() || null,
      amount: amount.trim(),
      currency: currency.trim().toUpperCase(),
      description: description.trim() || null,
    };

    const validation = validateCreateInvoiceInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitMode(mode);

    try {
      let created;
      if (mode === "draft") {
        created = await invoiceService.createDraft(input);
      } else {
        created = await invoiceService.createAndSubmit(input);
      }
      router.push(`/invoices/${created.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setSubmitMode(null);
      const message =
        err instanceof Error ? err.message : "Failed to create invoice. Please try again.";
      setErrors((prev) => ({ ...prev, form: message }));
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Invoices
      </Link>

      <PageHeader
        title="New Invoice"
        description="Enter the invoice details and optionally attach a document."
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

      {duplicateWarning && (
        <div
          role="note"
          aria-label="Duplicate invoice notice"
          className="flex items-start gap-2.5 rounded-lg bg-[#fef3c7] border border-[#fde68a] px-4 py-3 text-sm text-[#92400e]"
        >
          <AlertCircleIcon size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Possible duplicate:</strong> An
            invoice with number <strong>{invoiceNumber}</strong> already exists
            in your organization. You may still proceed if this is a replacement
            or separate billing.
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAction("draft");
        }}
        noValidate
        className="flex flex-col gap-6"
      >
        {/* Supplier Information */}
        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-5">
            Supplier Information
          </h2>
          <div className="flex flex-col gap-4">
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
                    setErrors((prev) => ({ ...prev, supplierName: undefined }));
                  }
                }}
                placeholder="e.g. Ethio Supplies Ltd."
                error={!!errors.supplierName}
                required
              />
            </FormField>
          </div>
        </Card>

        {/* Invoice Details */}
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
                    setErrors((prev) => ({ ...prev, invoiceNumber: undefined }));
                  }
                }}
                onBlur={handleInvoiceNumberBlur}
                placeholder="e.g. ETH-2026-0041"
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
                    setErrors((prev) => ({ ...prev, invoiceDate: undefined }));
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
              hint="Enter as a positive decimal, e.g. 12500.00"
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
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }
                }}
                placeholder="0.00"
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
                    setErrors((prev) => ({ ...prev, dueDate: undefined }));
                  }
                }}
                error={!!errors.dueDate}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                label="Description"
                htmlFor="description"
                hint="Optional notes or line item details"
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose or notes about this invoice…"
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Document (Clearly labeled as mock in prototype) */}
        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-3">
            Supporting Document
          </h2>
          <div className="flex items-center gap-3 p-4 border border-dashed border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
            <FileIcon size={24} className="text-[#94a3b8] shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#475569]">
                Attach an invoice document (PDF, PNG, JPG)
              </p>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                (Prototype: File storage is not connected in this phase.)
              </p>
            </div>
            <Button variant="outline" size="sm" type="button" disabled>
              Select File
            </Button>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            loading={isSubmitting && submitMode === "draft"}
            disabled={isSubmitting}
            onClick={() => handleAction("draft")}
          >
            Save Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isSubmitting && submitMode === "submit"}
            disabled={isSubmitting}
            onClick={() => handleAction("submit")}
          >
            Submit for Approval
          </Button>

          <Link href="/invoices">
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
