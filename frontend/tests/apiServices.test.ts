import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiInvoiceService } from "@/services/api/ApiInvoiceService";
import { ApiApprovalService } from "@/services/api/ApiApprovalService";
import { teamService } from "@/services/team";
import { api, ApiError } from "@/lib/api/client";
import type { Invoice, PageResult, DashboardSummary, TeamMember } from "@/types/invoice";

vi.mock("@/lib/api/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/client")>("@/lib/api/client");
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    },
  };
});

describe("ApiInvoiceService", () => {
  let invoiceService: ApiInvoiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    invoiceService = new ApiInvoiceService();
  });

  it("list constructs proper query parameters and calls v1/invoices", async () => {
    const mockResult: PageResult<Invoice> = {
      items: [],
      page: 1,
      size: 10,
      totalItems: 0,
      totalPages: 0,
    };
    vi.mocked(api.get).mockResolvedValueOnce(mockResult);

    const result = await invoiceService.list({
      status: "PENDING_APPROVAL",
      search: "Addis",
      fromDate: "2026-11-01",
      toDate: "2026-11-30",
      page: 2,
      size: 20,
      sortBy: "amount",
      sortDirection: "asc",
    });

    expect(api.get).toHaveBeenCalledWith(
      "v1/invoices?status=PENDING_APPROVAL&search=Addis&fromDate=2026-11-01&toDate=2026-11-30&page=2&pageSize=20&sortBy=amount&sortDirection=asc"
    );
    expect(result).toEqual(mockResult);
  });

  it("getById returns invoice when found", async () => {
    const mockInvoice: Partial<Invoice> = {
      id: "inv-1",
      supplierName: "Ethio Telecom",
      invoiceNumber: "ET-901",
    };
    vi.mocked(api.get).mockResolvedValueOnce(mockInvoice);

    const result = await invoiceService.getById("inv-1");

    expect(api.get).toHaveBeenCalledWith("v1/invoices/inv-1");
    expect(result?.id).toBe("inv-1");
  });

  it("getById returns null when 404 occurs", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiError("Not found", 404, null, "/api/v1/invoices/inv-missing")
    );

    const result = await invoiceService.getById("inv-missing");

    expect(result).toBeNull();
  });

  it("createDraft posts to v1/invoices", async () => {
    const input = {
      supplierName: "Addis Paper",
      invoiceNumber: "AP-101",
      amount: "1200.00",
      currency: "ETB",
      invoiceDate: "2026-11-01",
    };
    const mockCreated = { id: "inv-new", ...input, status: "DRAFT" };
    vi.mocked(api.post).mockResolvedValueOnce(mockCreated);

    const result = await invoiceService.createDraft(input);

    expect(api.post).toHaveBeenCalledWith("v1/invoices", input);
    expect(result.id).toBe("inv-new");
  });

  it("createAndSubmit posts to v1/invoices/submit", async () => {
    const input = {
      supplierName: "Addis Paper",
      invoiceNumber: "AP-102",
      amount: "3500.00",
      currency: "ETB",
      invoiceDate: "2026-11-01",
    };
    const mockCreated = { id: "inv-sub", ...input, status: "PENDING_APPROVAL" };
    vi.mocked(api.post).mockResolvedValueOnce(mockCreated);

    const result = await invoiceService.createAndSubmit(input);

    expect(api.post).toHaveBeenCalledWith("v1/invoices/submit", input);
    expect(result.id).toBe("inv-sub");
  });

  it("submitForApproval posts to v1/invoices/:id/submit", async () => {
    const mockUpdated = { id: "inv-1", status: "PENDING_APPROVAL" };
    vi.mocked(api.post).mockResolvedValueOnce(mockUpdated);

    const result = await invoiceService.submitForApproval("inv-1");

    expect(api.post).toHaveBeenCalledWith("v1/invoices/inv-1/submit");
    expect(result.status).toBe("PENDING_APPROVAL");
  });

  it("updateDraft puts to v1/invoices/:id", async () => {
    const input = { amount: "4000.00" };
    const mockUpdated = { id: "inv-1", amount: "4000.00", status: "DRAFT" };
    vi.mocked(api.put).mockResolvedValueOnce(mockUpdated);

    const result = await invoiceService.updateDraft("inv-1", input);

    expect(api.put).toHaveBeenCalledWith("v1/invoices/inv-1", input);
    expect(result.amount).toBe("4000.00");
  });

  it("getDashboardSummary requests v1/invoices/summary", async () => {
    const mockSummary: DashboardSummary = {
      totalInvoices: 10,
      pendingApprovals: 2,
      approvedInvoices: 5,
      rejectedInvoices: 1,
      draftInvoices: 2,
      recentInvoices: [],
      pendingApprovalInvoices: [],
    };
    vi.mocked(api.get).mockResolvedValueOnce(mockSummary);

    const result = await invoiceService.getDashboardSummary();

    expect(api.get).toHaveBeenCalledWith("v1/invoices/summary");
    expect(result.totalInvoices).toBe(10);
  });

  it("checkDuplicateInvoiceNumber calls endpoint and returns boolean", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ invoiceNumber: "INV-100", duplicate: true });

    const isDup = await invoiceService.checkDuplicateInvoiceNumber("INV-100", "inv-exclude");

    expect(api.get).toHaveBeenCalledWith(
      "v1/invoices/check-duplicate?invoiceNumber=INV-100&excludeId=inv-exclude"
    );
    expect(isDup).toBe(true);
  });
});

describe("ApiApprovalService", () => {
  let approvalService: ApiApprovalService;

  beforeEach(() => {
    vi.clearAllMocks();
    approvalService = new ApiApprovalService();
  });

  it("listPending requests v1/approvals/pending", async () => {
    const mockResult: PageResult<Invoice> = {
      items: [],
      page: 1,
      size: 10,
      totalItems: 0,
      totalPages: 0,
    };
    vi.mocked(api.get).mockResolvedValueOnce(mockResult);

    const result = await approvalService.listPending({ search: "Water", page: 1, size: 10 });

    expect(api.get).toHaveBeenCalledWith("v1/approvals/pending?search=Water&page=1&pageSize=10");
    expect(result).toEqual(mockResult);
  });

  it("approve posts to v1/approvals/:id/approve", async () => {
    const mockInvoice = { id: "inv-pending", status: "APPROVED" };
    vi.mocked(api.post).mockResolvedValueOnce(mockInvoice);

    const result = await approvalService.approve("inv-pending");

    expect(api.post).toHaveBeenCalledWith("v1/approvals/inv-pending/approve");
    expect(result.status).toBe("APPROVED");
  });

  it("reject posts to v1/approvals/:id/reject with mandatory reason", async () => {
    const mockInvoice = { id: "inv-pending", status: "REJECTED", rejectionReason: "Incorrect pricing" };
    vi.mocked(api.post).mockResolvedValueOnce(mockInvoice);

    const result = await approvalService.reject("inv-pending", "Incorrect pricing");

    expect(api.post).toHaveBeenCalledWith("v1/approvals/inv-pending/reject", {
      reason: "Incorrect pricing",
    });
    expect(result.status).toBe("REJECTED");
  });
});

describe("teamService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTeamMembers requests v1/organizations/team", async () => {
    const mockMembers: TeamMember[] = [
      {
        id: "user-1",
        name: "Abebe Girma",
        email: "abebe@acme.co",
        role: "OWNER",
        status: "ACTIVE",
      },
    ];
    vi.mocked(api.get).mockResolvedValueOnce(mockMembers);

    const result = await teamService.getTeamMembers();

    expect(api.get).toHaveBeenCalledWith("v1/organizations/team");
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("OWNER");
  });
});
