import { describe, it, expect, beforeEach } from "vitest";
import { MockInvoiceStore } from "@/services/mock/store";
import { MockInvoiceService } from "@/services/mock/MockInvoiceService";
import { MockApprovalService } from "@/services/mock/MockApprovalService";

describe("Phase 2 End-to-End User Flows", () => {
  let store: MockInvoiceStore;
  let invoiceService: MockInvoiceService;
  let approvalService: MockApprovalService;

  beforeEach(() => {
    store = new MockInvoiceStore();
    invoiceService = new MockInvoiceService(store);
    approvalService = new MockApprovalService(store);
  });

  it("User Flow 1 & 2: Save a valid invoice as a draft and locate it", async () => {
    const draftInput = {
      supplierName: "Ethio Telecom",
      invoiceNumber: "ET-2026-9901",
      amount: "18500.00",
      currency: "ETB",
      invoiceDate: "2026-10-27",
      dueDate: "2026-11-27",
      description: "Fiber internet service",
    };

    const draft = await invoiceService.createDraft(draftInput);
    expect(draft.id).toBeDefined();
    expect(draft.status).toBe("DRAFT");

    // Detail fetch
    const fetched = await invoiceService.getById(draft.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.supplierName).toBe("Ethio Telecom");

    // List search
    const list = await invoiceService.list({ search: "ET-2026-9901", page: 1, size: 10 });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe(draft.id);
  });

  it("User Flow 3 & 4: Submit a draft for approval and verify pending count updates", async () => {
    const initialPending = store.getPendingApprovalsCount();
    const initialSummary = await invoiceService.getDashboardSummary();

    const draft = await invoiceService.createDraft({
      supplierName: "Awash Wine SC",
      invoiceNumber: "AW-2026-12",
      amount: "76000.00",
      currency: "ETB",
      invoiceDate: "2026-10-25",
    });

    expect(store.getPendingApprovalsCount()).toBe(initialPending);

    const submitted = await invoiceService.submitForApproval(draft.id);
    expect(submitted.status).toBe("PENDING_APPROVAL");

    // Verified across store & dashboard
    expect(store.getPendingApprovalsCount()).toBe(initialPending + 1);

    const updatedSummary = await invoiceService.getDashboardSummary();
    expect(updatedSummary.pendingApprovals).toBe(initialSummary.pendingApprovals + 1);
    expect(updatedSummary.pendingApprovalInvoices.some((i) => i.id === draft.id)).toBe(true);
  });

  it("User Flow 5 & 7: Approve a pending invoice and confirm removal from queue", async () => {
    const pendingListBefore = await approvalService.listPending({ page: 1, size: 10 });
    const target = pendingListBefore.items[0];
    expect(target).toBeDefined();

    const approved = await approvalService.approve(target.id);
    expect(approved.status).toBe("APPROVED");

    const pendingListAfter = await approvalService.listPending({ page: 1, size: 10 });
    expect(pendingListAfter.items.some((i) => i.id === target.id)).toBe(false);

    const invoiceAfter = await invoiceService.getById(target.id);
    expect(invoiceAfter?.status).toBe("APPROVED");
  });

  it("User Flow 6 & 7: Reject a pending invoice with reason and verify history", async () => {
    const pendingListBefore = await approvalService.listPending({ page: 1, size: 10 });
    // Use second pending invoice if available
    const target = pendingListBefore.items.length > 1 ? pendingListBefore.items[1] : pendingListBefore.items[0];

    const reason = "Disputed transportation surcharge on invoice lines 2-4";
    const rejected = await approvalService.reject(target.id, reason);

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe(reason);

    // Verify removal from approval queue
    const pendingListAfter = await approvalService.listPending({ page: 1, size: 10 });
    expect(pendingListAfter.items.some((i) => i.id === target.id)).toBe(false);

    // Verify detail retrieval has rejection reason and activity event
    const invoiceDetail = await invoiceService.getById(target.id);
    expect(invoiceDetail?.status).toBe("REJECTED");
    expect(invoiceDetail?.rejectionReason).toBe(reason);
    expect(invoiceDetail?.activities?.some((a) => a.type === "REJECTED")).toBe(true);
  });

  it("User Flow 8, 9 & 10: Search, filter by status, paginate and clear filters", async () => {
    // Status filter: APPROVED
    const approvedOnly = await invoiceService.list({ status: "APPROVED", page: 1, size: 10 });
    expect(approvedOnly.items.length).toBeGreaterThan(0);
    expect(approvedOnly.items.every((i) => i.status === "APPROVED")).toBe(true);

    // Combined search and status
    const combined = await invoiceService.list({
      status: "APPROVED",
      search: "Addis",
      page: 1,
      size: 10,
    });
    expect(combined.items.every((i) => i.status === "APPROVED" && i.supplierName.includes("Addis"))).toBe(true);

    // Pagination bounds
    const page1 = await invoiceService.list({ page: 1, size: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.totalPages).toBeGreaterThanOrEqual(4);

    const page2 = await invoiceService.list({ page: 2, size: 2 });
    expect(page2.items).toHaveLength(2);
    expect(page2.items[0].id).not.toBe(page1.items[0].id);

    // Unfiltered list returns all
    const all = await invoiceService.list({ page: 1, size: 100 });
    expect(all.totalItems).toBe(store.getInvoices().length);
  });
});
