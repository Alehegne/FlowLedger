import { MOCK_INVOICES } from "@/lib/mock/fixtures";
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DashboardSummary,
  InvoiceActivity,
} from "@/types/invoice";
import {
  validateCreateInvoiceInput,
  validateUpdateInvoiceInput,
  validateRejectionReason,
} from "@/lib/utils/validation";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `inv-${crypto.randomUUID()}`;
  }
  return `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function cloneInitialInvoices(): Invoice[] {
  return JSON.parse(JSON.stringify(MOCK_INVOICES));
}

export interface InvoiceStoreSnapshot {
  invoices: Invoice[];
  version: number;
}

export class MockInvoiceStore {
  private invoices: Invoice[] = cloneInitialInvoices();
  private listeners: Set<() => void> = new Set();
  private version: number = 0;
  private snapshot: InvoiceStoreSnapshot;

  constructor() {
    this.invoices = cloneInitialInvoices();
    this.snapshot = {
      invoices: this.invoices,
      version: this.version,
    };
  }

  /** Subscribe to store mutations */
  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Notify all subscribers that state changed */
  private notify(): void {
    this.version += 1;
    this.snapshot = {
      invoices: this.invoices,
      version: this.version,
    };
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in store subscriber", err);
      }
    });
  }

  /**
   * Current snapshot for React useSyncExternalStore.
   * Returns a cached object reference that only changes when mutations occur.
   */
  public getSnapshot = (): InvoiceStoreSnapshot => {
    return this.snapshot;
  };

  /**
   * Server snapshot for React useSyncExternalStore.
   * Returns a stable cached object reference to prevent infinite re-render loops during SSR/PPR.
   */
  public getServerSnapshot = (): InvoiceStoreSnapshot => {
    return this.snapshot;
  };

  /** Reset store to original mock fixtures (used in testing and reloads) */
  public reset(): void {
    this.invoices = cloneInitialInvoices();
    this.notify();
  }

  /** Return all invoices currently in the store */
  public getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  /** Find an invoice by ID */
  public getInvoiceById(id: string): Invoice | null {
    const inv = this.invoices.find((i) => i.id === id);
    return inv ? { ...inv } : null;
  }

  /** Check if an invoice number already exists (excluding a specific invoice ID if updating) */
  public checkDuplicateInvoiceNumber(
    invoiceNumber: string,
    excludeId?: string
  ): boolean {
    const normalized = invoiceNumber.trim().toLowerCase();
    if (!normalized) return false;
    return this.invoices.some(
      (inv) =>
        inv.invoiceNumber.trim().toLowerCase() === normalized &&
        inv.id !== excludeId
    );
  }

  /** Get count of pending approval invoices */
  public getPendingApprovalsCount(): number {
    return this.invoices.filter((i) => i.status === "PENDING_APPROVAL").length;
  }

  /** Calculate summary metrics and lists */
  public getDashboardSummary(): DashboardSummary {
    const invoices = this.invoices;

    return {
      totalInvoices: invoices.length,
      pendingApprovals: invoices.filter((i) => i.status === "PENDING_APPROVAL").length,
      approvedInvoices: invoices.filter((i) => i.status === "APPROVED").length,
      rejectedInvoices: invoices.filter((i) => i.status === "REJECTED").length,
      draftInvoices: invoices.filter((i) => i.status === "DRAFT").length,
      recentInvoices: [...invoices]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
      pendingApprovalInvoices: invoices.filter(
        (i) => i.status === "PENDING_APPROVAL"
      ),
    };
  }

  /**
   * Create an invoice in DRAFT or PENDING_APPROVAL status.
   */
  public createInvoice(
    input: CreateInvoiceInput,
    status: "DRAFT" | "PENDING_APPROVAL" = "DRAFT"
  ): Invoice {
    const validation = validateCreateInvoiceInput(input);
    if (!validation.isValid) {
      const err = new Error("Invoice validation failed");
      (err as unknown as { fieldErrors: Record<string, string> }).fieldErrors = validation.errors;
      throw err;
    }

    const now = new Date().toISOString();
    const newId = generateId();

    const activities: InvoiceActivity[] = [
      {
        id: `act-${Date.now()}-1`,
        type: "CREATED",
        description:
          status === "DRAFT"
            ? "Invoice draft created"
            : "Invoice created and submitted for approval",
        actorName: "Abebe Girma",
        occurredAt: now,
      },
    ];

    if (status === "PENDING_APPROVAL") {
      activities.push({
        id: `act-${Date.now()}-2`,
        type: "SUBMITTED",
        description: "Submitted for approval",
        actorName: "Abebe Girma",
        occurredAt: now,
      });
    }

    const newInvoice: Invoice = {
      id: newId,
      supplierName: input.supplierName.trim(),
      invoiceNumber: input.invoiceNumber.trim(),
      amount: input.amount.trim(),
      currency: input.currency.trim().toUpperCase(),
      invoiceDate: input.invoiceDate.trim(),
      dueDate: input.dueDate?.trim() || null,
      description: input.description?.trim() || null,
      status,
      activities,
      createdAt: now,
      updatedAt: now,
    };

    // Prepend to invoices array so newly created invoices appear at the top
    this.invoices = [newInvoice, ...this.invoices];
    this.notify();

    return { ...newInvoice };
  }

  /**
   * Submit a DRAFT invoice for approval (DRAFT -> PENDING_APPROVAL).
   */
  public submitForApproval(id: string): Invoice {
    const invoiceIndex = this.invoices.findIndex((i) => i.id === id);
    if (invoiceIndex === -1) {
      throw new Error(`Invoice with id "${id}" not found.`);
    }

    const current = this.invoices[invoiceIndex];
    if (current.status !== "DRAFT") {
      throw new Error(
        `Cannot submit invoice in status "${current.status}". Only DRAFT invoices can be submitted for approval.`
      );
    }

    const now = new Date().toISOString();
    const updatedActivities = [
      ...(current.activities || []),
      {
        id: `act-${Date.now()}`,
        type: "SUBMITTED",
        description: "Submitted for approval",
        actorName: "Abebe Girma",
        occurredAt: now,
      },
    ];

    const updated: Invoice = {
      ...current,
      status: "PENDING_APPROVAL",
      activities: updatedActivities,
      updatedAt: now,
    };

    const nextInvoices = [...this.invoices];
    nextInvoices[invoiceIndex] = updated;
    this.invoices = nextInvoices;
    this.notify();

    return { ...updated };
  }

  /**
   * Update an existing DRAFT invoice.
   */
  public updateDraft(id: string, input: UpdateInvoiceInput): Invoice {
    const invoiceIndex = this.invoices.findIndex((i) => i.id === id);
    if (invoiceIndex === -1) {
      throw new Error(`Invoice with id "${id}" not found.`);
    }

    const current = this.invoices[invoiceIndex];
    if (current.status !== "DRAFT") {
      throw new Error(
        `Cannot edit invoice in status "${current.status}". Only DRAFT invoices can be edited.`
      );
    }

    const validation = validateUpdateInvoiceInput(input, current.invoiceDate);
    if (!validation.isValid) {
      const err = new Error("Invoice validation failed");
      (err as unknown as { fieldErrors: Record<string, string> }).fieldErrors = validation.errors;
      throw err;
    }

    const now = new Date().toISOString();
    const updated: Invoice = {
      ...current,
      supplierName:
        input.supplierName !== undefined
          ? input.supplierName.trim()
          : current.supplierName,
      invoiceNumber:
        input.invoiceNumber !== undefined
          ? input.invoiceNumber.trim()
          : current.invoiceNumber,
      amount: input.amount !== undefined ? input.amount.trim() : current.amount,
      currency:
        input.currency !== undefined
          ? input.currency.trim().toUpperCase()
          : current.currency,
      invoiceDate:
        input.invoiceDate !== undefined
          ? input.invoiceDate.trim()
          : current.invoiceDate,
      dueDate:
        input.dueDate !== undefined
          ? input.dueDate?.trim() || null
          : current.dueDate,
      description:
        input.description !== undefined
          ? input.description?.trim() || null
          : current.description,
      activities: [
        ...(current.activities || []),
        {
          id: `act-${Date.now()}`,
          type: "EDITED",
          description: "Draft details updated",
          actorName: "Abebe Girma",
          occurredAt: now,
        },
      ],
      updatedAt: now,
    };

    const nextInvoices = [...this.invoices];
    nextInvoices[invoiceIndex] = updated;
    this.invoices = nextInvoices;
    this.notify();

    return { ...updated };
  }

  /**
   * Approve a PENDING_APPROVAL invoice (PENDING_APPROVAL -> APPROVED).
   */
  public approve(id: string): Invoice {
    const invoiceIndex = this.invoices.findIndex((i) => i.id === id);
    if (invoiceIndex === -1) {
      throw new Error(`Invoice with id "${id}" not found.`);
    }

    const current = this.invoices[invoiceIndex];
    if (current.status !== "PENDING_APPROVAL") {
      throw new Error(
        `Cannot approve invoice in status "${current.status}". Only PENDING_APPROVAL invoices can be approved.`
      );
    }

    const now = new Date().toISOString();
    const updated: Invoice = {
      ...current,
      status: "APPROVED",
      activities: [
        ...(current.activities || []),
        {
          id: `act-${Date.now()}`,
          type: "APPROVED",
          description: "Invoice approved",
          actorName: "Dawit Bekele",
          occurredAt: now,
        },
      ],
      updatedAt: now,
    };

    const nextInvoices = [...this.invoices];
    nextInvoices[invoiceIndex] = updated;
    this.invoices = nextInvoices;
    this.notify();

    return { ...updated };
  }

  /**
   * Reject a PENDING_APPROVAL invoice (PENDING_APPROVAL -> REJECTED).
   */
  public reject(id: string, reason: string): Invoice {
    const reasonValidation = validateRejectionReason(reason);
    if (!reasonValidation.isValid) {
      throw new Error(reasonValidation.error || "A rejection reason is required.");
    }

    const invoiceIndex = this.invoices.findIndex((i) => i.id === id);
    if (invoiceIndex === -1) {
      throw new Error(`Invoice with id "${id}" not found.`);
    }

    const current = this.invoices[invoiceIndex];
    if (current.status !== "PENDING_APPROVAL") {
      throw new Error(
        `Cannot reject invoice in status "${current.status}". Only PENDING_APPROVAL invoices can be rejected.`
      );
    }

    const now = new Date().toISOString();
    const updated: Invoice = {
      ...current,
      status: "REJECTED",
      rejectionReason: reason.trim(),
      activities: [
        ...(current.activities || []),
        {
          id: `act-${Date.now()}`,
          type: "REJECTED",
          description: `Invoice rejected: ${reason.trim()}`,
          actorName: "Dawit Bekele",
          occurredAt: now,
        },
      ],
      updatedAt: now,
    };

    const nextInvoices = [...this.invoices];
    nextInvoices[invoiceIndex] = updated;
    this.invoices = nextInvoices;
    this.notify();

    return { ...updated };
  }
}

/** Global singleton store instance for browser runtime */
export const mockStore = new MockInvoiceStore();
