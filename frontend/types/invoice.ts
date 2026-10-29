// Shared domain types for FlowLedger

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "FINANCE"
  | "APPROVER"
  | "VIEWER";

export type MembershipStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface Money {
  amount: string;
  currency: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  dueDate: string | null;
  description: string | null;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDocument {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  previewUrl?: string;
}

export interface InvoiceActivity {
  id: string;
  type: string;
  description: string;
  actorName: string | null;
  occurredAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  role: OrganizationRole;
}

export interface CurrentSession {
  user: CurrentUser;
  organization: OrganizationSummary;
  permissions: string[];
}

export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: OrganizationRole;
  status: MembershipStatus;
}

export interface PageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface InvoiceFilters extends PageRequest {
  search?: string;
  status?: InvoiceStatus;
  fromDate?: string;
  toDate?: string;
}

export interface AppError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface CreateInvoiceInput {
  supplierName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  dueDate?: string | null;
  description?: string | null;
}

export interface DashboardSummary {
  totalInvoices: number;
  pendingApprovals: number;
  approvedInvoices: number;
  rejectedInvoices: number;
  draftInvoices: number;
  recentInvoices: Invoice[];
  pendingApprovalInvoices: Invoice[];
}
