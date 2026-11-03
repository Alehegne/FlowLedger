import type { ApprovalService } from "@/services/contracts/invoice";
import type { Invoice, PageRequest, PageResult } from "@/types/invoice";
import { mockStore, MockInvoiceStore } from "@/services/mock/store";

export class MockApprovalService implements ApprovalService {
  constructor(private store: MockInvoiceStore = mockStore) {}

  public async listPending(
    filters: PageRequest & { search?: string }
  ): Promise<PageResult<Invoice>> {
    let items = this.store
      .getInvoices()
      .filter((inv) => inv.status === "PENDING_APPROVAL");

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (inv) =>
          inv.supplierName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q)
      );
    }

    // Sort pending items (newest updatedAt first by default)
    items.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const page = Math.max(1, filters.page || 1);
    const size = Math.max(1, filters.size || 10);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));

    const startIndex = (page - 1) * size;
    const paginatedItems = items.slice(startIndex, startIndex + size);

    return {
      items: paginatedItems,
      page,
      size,
      totalItems,
      totalPages,
    };
  }

  public async approve(id: string): Promise<Invoice> {
    return this.store.approve(id);
  }

  public async reject(id: string, reason: string): Promise<Invoice> {
    return this.store.reject(id, reason);
  }
}
