import { ApiInvoiceService } from "@/services/api/ApiInvoiceService";
import { ApiApprovalService } from "@/services/api/ApiApprovalService";
import type { InvoiceService, ApprovalService } from "@/services/contracts/invoice";

// Singleton services backed by FlowLedger backend REST API
export const invoiceService: InvoiceService = new ApiInvoiceService();
export const approvalService: ApprovalService = new ApiApprovalService();

export * from "@/services/contracts/invoice";
export { invoiceStore } from "@/services/invoiceStore";
export { mockStore } from "@/services/mock/store";
