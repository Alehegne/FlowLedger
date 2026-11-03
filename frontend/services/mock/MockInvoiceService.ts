import type { InvoiceService } from "@/services/contracts/invoice";
import type {
  Invoice,
  InvoiceFilters,
  PageResult,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DashboardSummary,
} from "@/types/invoice";
import { mockStore, MockInvoiceStore } from "@/services/mock/store";

export class MockInvoiceService implements InvoiceService {
  constructor(private store: MockInvoiceStore = mockStore) {}

  public async list(filters: InvoiceFilters): Promise<PageResult<Invoice>> {
    let items = this.store.getInvoices();

    // 1. Text search across supplierName and invoiceNumber
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (inv) =>
          inv.supplierName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (filters.status) {
      items = items.filter((inv) => inv.status === filters.status);
    }

    // 3. Date range filters
    if (filters.fromDate && filters.fromDate.trim()) {
      items = items.filter((inv) => inv.invoiceDate >= filters.fromDate!.trim());
    }
    if (filters.toDate && filters.toDate.trim()) {
      items = items.filter((inv) => inv.invoiceDate <= filters.toDate!.trim());
    }

    // 4. Sorting
    const sortBy = filters.sortBy || "invoiceDate";
    const sortDirection = filters.sortDirection || "desc";
    const dirMultiplier = sortDirection === "asc" ? 1 : -1;

    items.sort((a, b) => {
      switch (sortBy) {
        case "amount": {
          const numA = parseFloat(a.amount) || 0;
          const numB = parseFloat(b.amount) || 0;
          return (numA - numB) * dirMultiplier;
        }
        case "supplierName": {
          return a.supplierName.localeCompare(b.supplierName) * dirMultiplier;
        }
        case "invoiceNumber": {
          return a.invoiceNumber.localeCompare(b.invoiceNumber) * dirMultiplier;
        }
        case "status": {
          return a.status.localeCompare(b.status) * dirMultiplier;
        }
        case "createdAt": {
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
            dirMultiplier
          );
        }
        case "updatedAt": {
          return (
            (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
            dirMultiplier
          );
        }
        case "invoiceDate":
        default: {
          return a.invoiceDate.localeCompare(b.invoiceDate) * dirMultiplier;
        }
      }
    });

    // 5. Pagination
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

  public async getById(id: string): Promise<Invoice | null> {
    return this.store.getInvoiceById(id);
  }

  public async createDraft(input: CreateInvoiceInput): Promise<Invoice> {
    return this.store.createInvoice(input, "DRAFT");
  }

  public async createAndSubmit(input: CreateInvoiceInput): Promise<Invoice> {
    return this.store.createInvoice(input, "PENDING_APPROVAL");
  }

  public async submitForApproval(id: string): Promise<Invoice> {
    return this.store.submitForApproval(id);
  }

  public async updateDraft(
    id: string,
    input: UpdateInvoiceInput
  ): Promise<Invoice> {
    return this.store.updateDraft(id, input);
  }

  public async getDashboardSummary(): Promise<DashboardSummary> {
    return this.store.getDashboardSummary();
  }

  public async checkDuplicateInvoiceNumber(
    invoiceNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    return this.store.checkDuplicateInvoiceNumber(invoiceNumber, excludeId);
  }
}
