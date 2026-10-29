"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "@/components/ui/Input";
import { ArrowLeftIcon, FileIcon } from "@/components/ui/Icons";

export default function NewInvoicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Prototype: simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#dcfce7] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0f172a]">Invoice submitted</h2>
        <p className="text-sm text-[#475569]">
          Your invoice has been saved as a draft (prototype simulation).
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/invoices">
            <Button variant="primary">Back to Invoices</Button>
          </Link>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            New Invoice
          </Button>
        </div>
      </div>
    );
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

      <div
        role="note"
        className="rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 text-sm text-[#475569]"
      >
        <strong className="text-[#0f172a]">Prototype:</strong> This form
        simulates invoice creation. No data is persisted to a backend.
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-5">Supplier Information</h2>
          <div className="flex flex-col gap-4">
            <FormField label="Supplier Name" htmlFor="supplierName" required>
              <Input id="supplierName" placeholder="e.g. Ethio Supplies Ltd." required />
            </FormField>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-5">Invoice Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Invoice Number" htmlFor="invoiceNumber" required>
              <Input id="invoiceNumber" placeholder="e.g. INV-2026-001" required />
            </FormField>

            <FormField label="Invoice Date" htmlFor="invoiceDate" required>
              <Input id="invoiceDate" type="date" required />
            </FormField>

            <FormField label="Amount" htmlFor="amount" required hint="Enter as a decimal number, e.g. 12500.00">
              <Input id="amount" type="text" inputMode="decimal" placeholder="0.00" required />
            </FormField>

            <FormField label="Currency" htmlFor="currency" required>
              <Select id="currency" defaultValue="ETB">
                <option value="ETB">ETB — Ethiopian Birr</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </Select>
            </FormField>

            <FormField label="Due Date" htmlFor="dueDate">
              <Input id="dueDate" type="date" />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Description" htmlFor="description" hint="Optional notes about this invoice">
                <Textarea id="description" placeholder="Purpose or notes…" rows={3} />
              </FormField>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[#0f172a] mb-3">Document</h2>
          <div className="flex items-center gap-3 p-4 border border-dashed border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
            <FileIcon size={24} className="text-[#94a3b8] shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#475569]">
                Attach an invoice document (PDF, PNG, JPG — max 10 MB)
              </p>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                File upload will be connected in the next phase.
              </p>
            </div>
            <Button variant="outline" size="sm" type="button" disabled>
              Select File
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
          >
            Save Draft
          </Button>
          <Button type="button" variant="outline" size="md" disabled={isSubmitting}>
            Submit for Approval
          </Button>
          <Link href="/invoices">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
