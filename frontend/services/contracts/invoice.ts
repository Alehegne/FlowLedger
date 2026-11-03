import type {
  Invoice,
  InvoiceFilters,
  PageResult,
  PageRequest,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DashboardSummary,
} from "@/types/invoice";

export interface InvoiceService {
  /**
   * Search, filter, sort, and paginate invoices.
   */
  list(filters: InvoiceFilters): Promise<PageResult<Invoice>>;

  /**
   * Retrieve an invoice by its ID.
   */
  getById(id: string): Promise<Invoice | null>;

  /**
   * Create a new invoice in DRAFT status.
   */
  createDraft(input: CreateInvoiceInput): Promise<Invoice>;

  /**
   * Create a new invoice directly in PENDING_APPROVAL status.
   */
  createAndSubmit(input: CreateInvoiceInput): Promise<Invoice>;

  /**
   * Submit an existing DRAFT invoice for approval (DRAFT -> PENDING_APPROVAL).
   */
  submitForApproval(id: string): Promise<Invoice>;

  /**
   * Update an existing DRAFT invoice. Non-draft invoices cannot be updated.
   */
  updateDraft(id: string, input: UpdateInvoiceInput): Promise<Invoice>;

  /**
   * Calculate dashboard summary metrics and lists from the current store.
   */
  getDashboardSummary(): Promise<DashboardSummary>;

  /**
   * Check if an invoice number already exists (for warning display).
   */
  checkDuplicateInvoiceNumber(invoiceNumber: string, excludeId?: string): Promise<boolean>;
}

export interface ApprovalService {
  /**
   * List all invoices awaiting approval (status = PENDING_APPROVAL).
   */
  listPending(filters: PageRequest & { search?: string }): Promise<PageResult<Invoice>>;

  /**
   * Approve a pending invoice (PENDING_APPROVAL -> APPROVED).
   */
  approve(id: string): Promise<Invoice>;

  /**
   * Reject a pending invoice with a mandatory reason (PENDING_APPROVAL -> REJECTED).
   */
  reject(id: string, reason: string): Promise<Invoice>;
}
