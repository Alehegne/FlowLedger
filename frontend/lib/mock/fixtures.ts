/**
 * PROTOTYPE ONLY — Mock invoice fixtures.
 * These records are isolated here and imported only through service interfaces.
 * Replace by connecting ApiInvoiceService to the real backend.
 */

import type { Invoice, TeamMember, DashboardSummary } from "@/types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    supplierName: "Ethio Supplies Ltd.",
    invoiceNumber: "ETH-2026-0041",
    amount: "48500.00",
    currency: "ETB",
    invoiceDate: "2026-10-15",
    dueDate: "2026-11-15",
    description: "Office supplies for Q4",
    status: "PENDING_APPROVAL",
    createdAt: "2026-10-15T09:12:00Z",
    updatedAt: "2026-10-16T11:00:00Z",
  },
  {
    id: "inv-002",
    supplierName: "Addis Tech Solutions",
    invoiceNumber: "ATS-INV-20261001",
    amount: "125000.00",
    currency: "ETB",
    invoiceDate: "2026-10-01",
    dueDate: "2026-10-31",
    description: "IT maintenance contract — October",
    status: "APPROVED",
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-03T14:30:00Z",
  },
  {
    id: "inv-003",
    supplierName: "Bole Cleaning Services",
    invoiceNumber: "BCS-2026-009",
    amount: "9800.00",
    currency: "ETB",
    invoiceDate: "2026-10-20",
    dueDate: "2026-11-05",
    description: "Monthly office cleaning",
    status: "DRAFT",
    createdAt: "2026-10-20T13:45:00Z",
    updatedAt: "2026-10-20T13:45:00Z",
  },
  {
    id: "inv-004",
    supplierName: "Highland Printing",
    invoiceNumber: "HP-INV-0892",
    amount: "32400.00",
    currency: "ETB",
    invoiceDate: "2026-09-28",
    dueDate: "2026-10-28",
    description: "Promotional materials and brochures",
    status: "REJECTED",
    createdAt: "2026-09-28T10:00:00Z",
    updatedAt: "2026-10-02T09:00:00Z",
  },
  {
    id: "inv-005",
    supplierName: "Sheger Logistics",
    invoiceNumber: "SL-2026-114",
    amount: "18750.00",
    currency: "ETB",
    invoiceDate: "2026-10-10",
    dueDate: null,
    description: "Delivery services — October batch",
    status: "PENDING_APPROVAL",
    createdAt: "2026-10-10T07:30:00Z",
    updatedAt: "2026-10-11T08:00:00Z",
  },
  {
    id: "inv-006",
    supplierName: "Abyssinia Furniture",
    invoiceNumber: "AF-10-2026-055",
    amount: "74200.00",
    currency: "ETB",
    invoiceDate: "2026-09-15",
    dueDate: "2026-10-15",
    description: "Conference room chairs",
    status: "CANCELLED",
    createdAt: "2026-09-15T11:00:00Z",
    updatedAt: "2026-10-01T15:00:00Z",
  },
  {
    id: "inv-007",
    supplierName: "Summit Security",
    invoiceNumber: "SS-2026-Q4-001",
    amount: "36000.00",
    currency: "ETB",
    invoiceDate: "2026-10-25",
    dueDate: "2026-11-25",
    description: "Security services — November",
    status: "PENDING_APPROVAL",
    createdAt: "2026-10-25T09:00:00Z",
    updatedAt: "2026-10-25T09:00:00Z",
  },
  {
    id: "inv-008",
    supplierName: "Dagi Catering",
    invoiceNumber: "DC-OCT-2026",
    amount: "15600.00",
    currency: "ETB",
    invoiceDate: "2026-10-22",
    dueDate: "2026-11-01",
    description: "Staff lunch — week 43",
    status: "APPROVED",
    createdAt: "2026-10-22T12:00:00Z",
    updatedAt: "2026-10-23T10:00:00Z",
  },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-001",
    name: "Abebe Girma",
    email: "abebe@acme.co",
    role: "OWNER",
    status: "ACTIVE",
  },
  {
    id: "user-002",
    name: "Hiwot Tadesse",
    email: "hiwot@acme.co",
    role: "FINANCE",
    status: "ACTIVE",
  },
  {
    id: "user-003",
    name: "Dawit Bekele",
    email: "dawit@acme.co",
    role: "APPROVER",
    status: "ACTIVE",
  },
  {
    id: "user-004",
    name: null,
    email: "tigist@acme.co",
    role: "VIEWER",
    status: "INVITED",
  },
];

/** Derive consistent summary counts from the single MOCK_INVOICES source. */
export function getMockDashboardSummary(): DashboardSummary {
  const invoices = MOCK_INVOICES;

  return {
    totalInvoices: invoices.length,
    pendingApprovals: invoices.filter((i) => i.status === "PENDING_APPROVAL").length,
    approvedInvoices: invoices.filter((i) => i.status === "APPROVED").length,
    rejectedInvoices: invoices.filter((i) => i.status === "REJECTED").length,
    draftInvoices: invoices.filter((i) => i.status === "DRAFT").length,
    recentInvoices: [...invoices]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    pendingApprovalInvoices: invoices.filter(
      (i) => i.status === "PENDING_APPROVAL"
    ),
  };
}
