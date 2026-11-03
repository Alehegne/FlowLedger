import { api } from "@/lib/api/client";
import { invoiceStore } from "@/services/invoiceStore";
import type { ApprovalService } from "@/services/contracts/invoice";
import type { Invoice, PageRequest, PageResult } from "@/types/invoice";

export class ApiApprovalService implements ApprovalService {
  async listPending(filters: PageRequest & { search?: string }): Promise<PageResult<Invoice>> {
    const params = new URLSearchParams();

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }
    if (filters.page) {
      params.set("page", String(filters.page));
    }
    if (filters.size) {
      params.set("pageSize", String(filters.size));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `v1/approvals/pending?${queryString}` : "v1/approvals/pending";

    return api.get<PageResult<Invoice>>(endpoint);
  }

  async approve(id: string): Promise<Invoice> {
    const updated = await api.post<Invoice>(`v1/approvals/${encodeURIComponent(id)}/approve`);
    invoiceStore.upsert(updated);
    return updated;
  }

  async reject(id: string, reason: string): Promise<Invoice> {
    const updated = await api.post<Invoice>(`v1/approvals/${encodeURIComponent(id)}/reject`, { reason });
    invoiceStore.upsert(updated);
    return updated;
  }
}
