import { describe, it, expect, beforeEach } from "vitest";
import { MockInvoiceStore } from "@/services/mock/store";
import { MockInvoiceService } from "@/services/mock/MockInvoiceService";
import { MockApprovalService } from "@/services/mock/MockApprovalService";

describe("Invoice and Approval Services", () => {
  let store: MockInvoiceStore;
  let invoiceService: MockInvoiceService;
  let approvalService: MockApprovalService;

  beforeEach(() => {
    store = new MockInvoiceStore();
    invoiceService = new MockInvoiceService(store);
    approvalService = new MockApprovalService(store);
  });

  describe("Invoice Creation", () => {
    it("creates a draft invoice with valid fields", async () => {
      const initialTotal = (await invoiceService.list({ page: 1, size: 100 })).totalItems;

      const created = await invoiceService.createDraft({
        supplierName: "Nile Cement Co.",
        invoiceNumber: "NCC-2026-901",
        amount: "84000.50",
        currency: "ETB",
        invoiceDate: "2026-10-25",
        dueDate: "2026-11-25",
        description: "Cement batch",
      });

      expect(created.id).toBeDefined();
      expect(created.status).toBe("DRAFT");
      expect(created.supplierName).toBe("Nile Cement Co.");
      expect(created.amount).toBe("84000.50");
      expect(created.activities?.length).toBeGreaterThan(0);

      const afterList = await invoiceService.list({ page: 1, size: 100 });
      expect(afterList.totalItems).toBe(initialTotal + 1);
    });

    it("creates and immediately submits an invoice for approval", async () => {
      const initialPending = store.getPendingApprovalsCount();

      const created = await invoiceService.createAndSubmit({
        supplierName: "Dire Dawa Logistics",
        invoiceNumber: "DDL-2026-004",
        amount: "15200.00",
        currency: "ETB",
        invoiceDate: "2026-10-26",
      });

      expect(created.status).toBe("PENDING_APPROVAL");
      expect(store.getPendingApprovalsCount()).toBe(initialPending + 1);
    });

    it("detects possible duplicate invoice numbers", async () => {
      // "ETH-2026-0041" exists in initial fixtures
      const isDup = await invoiceService.checkDuplicateInvoiceNumber("ETH-2026-0041");
      expect(isDup).toBe(true);

      const isNotDup = await invoiceService.checkDuplicateInvoiceNumber("BRAND-NEW-999");
      expect(isNotDup).toBe(false);
    });
  });

  describe("Status Transitions", () => {
    it("allows submitting a DRAFT invoice for approval", async () => {
      const draft = await invoiceService.createDraft({
        supplierName: "Test Supplier",
        invoiceNumber: "TEST-001",
        amount: "5000.00",
        currency: "ETB",
        invoiceDate: "2026-10-20",
      });

      expect(draft.status).toBe("DRAFT");

      const submitted = await invoiceService.submitForApproval(draft.id);
      expect(submitted.status).toBe("PENDING_APPROVAL");

      const fetched = await invoiceService.getById(draft.id);
      expect(fetched?.status).toBe("PENDING_APPROVAL");
    });

    it("rejects submitting an invoice that is not in DRAFT status", async () => {
      // inv-002 is APPROVED in initial fixtures
      await expect(invoiceService.submitForApproval("inv-002")).rejects.toThrow(
        /Only DRAFT invoices can be submitted/
      );
    });

    it("allows approving an invoice in PENDING_APPROVAL status", async () => {
      // inv-001 is PENDING_APPROVAL
      const initialPending = store.getPendingApprovalsCount();
      const approved = await approvalService.approve("inv-001");

      expect(approved.status).toBe("APPROVED");
      expect(store.getPendingApprovalsCount()).toBe(initialPending - 1);

      const fetched = await invoiceService.getById("inv-001");
      expect(fetched?.status).toBe("APPROVED");
    });

    it("rejects approving an invoice that is not in PENDING_APPROVAL status", async () => {
      // inv-003 is DRAFT
      await expect(approvalService.approve("inv-003")).rejects.toThrow(
        /Only PENDING_APPROVAL invoices can be approved/
      );
    });

    it("allows rejecting a PENDING_APPROVAL invoice with a reason", async () => {
      // inv-005 is PENDING_APPROVAL
      const initialPending = store.getPendingApprovalsCount();
      const reason = "Supplier price mismatch on item 4";

      const rejected = await approvalService.reject("inv-005", reason);
      expect(rejected.status).toBe("REJECTED");
      expect(rejected.rejectionReason).toBe(reason);
      expect(store.getPendingApprovalsCount()).toBe(initialPending - 1);

      const fetched = await invoiceService.getById("inv-005");
      expect(fetched?.status).toBe("REJECTED");
      expect(fetched?.rejectionReason).toBe(reason);
    });

    it("fails rejecting without a valid reason", async () => {
      await expect(approvalService.reject("inv-005", "")).rejects.toThrow(
        /rejection reason is required/
      );
      await expect(approvalService.reject("inv-005", "  ")).rejects.toThrow(
        /rejection reason is required/
      );
    });
  });

  describe("Search, Filter, Sort, and Pagination", () => {
    it("filters invoices by text search (case-insensitive)", async () => {
      const result = await invoiceService.list({
        search: "Ethio",
        page: 1,
        size: 10,
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((item) => {
        const matchesSupplier = item.supplierName.toLowerCase().includes("ethio");
        const matchesNumber = item.invoiceNumber.toLowerCase().includes("ethio");
        expect(matchesSupplier || matchesNumber).toBe(true);
      });
    });

    it("filters invoices by status", async () => {
      const result = await invoiceService.list({
        status: "APPROVED",
        page: 1,
        size: 10,
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((item) => {
        expect(item.status).toBe("APPROVED");
      });
    });

    it("sorts invoices by amount ascending and descending", async () => {
      const ascResult = await invoiceService.list({
        sortBy: "amount",
        sortDirection: "asc",
        page: 1,
        size: 100,
      });

      for (let i = 0; i < ascResult.items.length - 1; i++) {
        const current = parseFloat(ascResult.items[i].amount);
        const next = parseFloat(ascResult.items[i + 1].amount);
        expect(current).toBeLessThanOrEqual(next);
      }

      const descResult = await invoiceService.list({
        sortBy: "amount",
        sortDirection: "desc",
        page: 1,
        size: 100,
      });

      for (let i = 0; i < descResult.items.length - 1; i++) {
        const current = parseFloat(descResult.items[i].amount);
        const next = parseFloat(descResult.items[i + 1].amount);
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("paginates properly across pages", async () => {
      const page1 = await invoiceService.list({ page: 1, size: 3 });
      expect(page1.items.length).toBe(3);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBeGreaterThanOrEqual(3);

      const page2 = await invoiceService.list({ page: 2, size: 3 });
      expect(page2.items.length).toBe(3);
      expect(page2.page).toBe(2);

      // Verify no duplicate IDs between page 1 and page 2
      const page1Ids = page1.items.map((i) => i.id);
      page2.items.forEach((i) => {
        expect(page1Ids).not.toContain(i.id);
      });
    });
  });

  describe("Dashboard Summary Synchronization", () => {
    it("synchronously derives dashboard metrics from underlying store state", async () => {
      const summaryBefore = await invoiceService.getDashboardSummary();
      expect(summaryBefore.pendingApprovals).toBe(store.getPendingApprovalsCount());

      // Approve one pending invoice
      await approvalService.approve("inv-001");

      const summaryAfter = await invoiceService.getDashboardSummary();
      expect(summaryAfter.pendingApprovals).toBe(summaryBefore.pendingApprovals - 1);
      expect(summaryAfter.approvedInvoices).toBe(summaryBefore.approvedInvoices + 1);
    });
  });

  describe("Snapshot Caching for useSyncExternalStore", () => {
    it("returns referentially stable snapshots when no mutations occur", () => {
      const snap1 = store.getSnapshot();
      const snap2 = store.getSnapshot();
      expect(snap1).toBe(snap2);

      const serverSnap1 = store.getServerSnapshot();
      const serverSnap2 = store.getServerSnapshot();
      expect(serverSnap1).toBe(serverSnap2);
      expect(snap1).toBe(serverSnap1);
    });

    it("creates a new snapshot reference only when a mutation occurs", async () => {
      const snapBefore = store.getSnapshot();

      await invoiceService.createDraft({
        supplierName: "Test Supplier",
        invoiceNumber: "SNAP-01",
        amount: "100.00",
        currency: "ETB",
        invoiceDate: "2026-10-20",
      });

      const snapAfter = store.getSnapshot();
      expect(snapBefore).not.toBe(snapAfter);
      expect(snapAfter.version).toBeGreaterThan(snapBefore.version);
    });
  });
});
