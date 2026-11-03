import { api } from "@/lib/api/client";
import type { Invoice, PageResult } from "@/types/invoice";

export interface InvoiceStoreSnapshot {
  invoices: Invoice[];
  version: number;
  isLoaded: boolean;
}

export class InvoiceStore {
  private invoices: Invoice[] = [];
  private listeners: Set<() => void> = new Set();
  private version: number = 0;
  private isLoaded: boolean = false;
  private isFetching: boolean = false;
  private snapshot: InvoiceStoreSnapshot;

  constructor() {
    this.snapshot = {
      invoices: this.invoices,
      version: this.version,
      isLoaded: this.isLoaded,
    };
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (!this.isLoaded && !this.isFetching && typeof window !== "undefined") {
      this.refresh();
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): InvoiceStoreSnapshot => {
    return this.snapshot;
  };

  public getServerSnapshot = (): InvoiceStoreSnapshot => {
    return this.snapshot;
  };

  private notify(): void {
    this.version += 1;
    this.snapshot = {
      invoices: [...this.invoices],
      version: this.version,
      isLoaded: this.isLoaded,
    };
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in invoice store listener", err);
      }
    });
  }

  public async refresh(): Promise<void> {
    if (this.isFetching) return;
    this.isFetching = true;
    try {
      const res = await api.get<PageResult<Invoice>>("v1/invoices?page=1&pageSize=100");
      if (res && Array.isArray(res.items)) {
        this.invoices = res.items;
        this.isLoaded = true;
        this.notify();
      }
    } catch (err) {
      console.error("Failed to load invoices from backend API", err);
    } finally {
      this.isFetching = false;
    }
  }

  public upsert(invoice: Invoice): void {
    const idx = this.invoices.findIndex((i) => i.id === invoice.id);
    if (idx >= 0) {
      this.invoices[idx] = invoice;
    } else {
      this.invoices.unshift(invoice);
    }
    this.isLoaded = true;
    this.notify();
  }

  public async getInvoiceById(id: string): Promise<Invoice | null> {
    const existing = this.invoices.find((i) => i.id === id);
    if (existing) return existing;

    try {
      const invoice = await api.get<Invoice>(`v1/invoices/${encodeURIComponent(id)}`);
      if (invoice) {
        this.upsert(invoice);
        return invoice;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const invoiceStore = new InvoiceStore();
