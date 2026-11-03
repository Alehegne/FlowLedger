import { api, ApiError } from "@/lib/api/client";
import { invoiceStore } from "@/services/invoiceStore";
import type { InvoiceService } from "@/services/contracts/invoice";
import type {
  Invoice,
  InvoiceFilters,
  PageResult,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DashboardSummary,
} from "@/types/invoice";

export class ApiInvoiceService implements InvoiceService {
  async list(filters: InvoiceFilters): Promise<PageResult<Invoice>> {
    const params = new URLSearchParams();

    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }
    if (filters.fromDate) {
      params.set("fromDate", filters.fromDate);
    }
    if (filters.toDate) {
      params.set("toDate", filters.toDate);
    }
    if (filters.page) {
      params.set("page", String(filters.page));
    }
    if (filters.size) {
      params.set("pageSize", String(filters.size));
    }
    if (filters.sortBy) {
      params.set("sortBy", filters.sortBy);
    }
    if (filters.sortDirection) {
      params.set("sortDirection", filters.sortDirection);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `v1/invoices?${queryString}` : "v1/invoices";

    return api.get<PageResult<Invoice>>(endpoint);
  }

  async getById(id: string): Promise<Invoice | null> {
    try {
      const invoice = await api.get<Invoice>(`v1/invoices/${encodeURIComponent(id)}`);
      if (invoice) {
        invoiceStore.upsert(invoice);
      }
      return invoice;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createDraft(input: CreateInvoiceInput): Promise<Invoice> {
    const created = await api.post<Invoice>("v1/invoices", input);
    invoiceStore.upsert(created);
    return created;
  }

  async createAndSubmit(input: CreateInvoiceInput): Promise<Invoice> {
    const created = await api.post<Invoice>("v1/invoices/submit", input);
    invoiceStore.upsert(created);
    return created;
  }

  async submitForApproval(id: string): Promise<Invoice> {
    const updated = await api.post<Invoice>(`v1/invoices/${encodeURIComponent(id)}/submit`);
    invoiceStore.upsert(updated);
    return updated;
  }

  async updateDraft(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
    const updated = await api.put<Invoice>(`v1/invoices/${encodeURIComponent(id)}`, input);
    invoiceStore.upsert(updated);
    return updated;
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return api.get<DashboardSummary>("v1/invoices/summary");
  }

  async checkDuplicateInvoiceNumber(invoiceNumber: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ invoiceNumber });
    if (excludeId) {
      params.set("excludeId", excludeId);
    }
    const res = await api.get<{ invoiceNumber: string; duplicate: boolean }>(
      `v1/invoices/check-duplicate?${params.toString()}`
    );
    return res.duplicate;
  }
}
