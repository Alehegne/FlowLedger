package com.example.flowLedger_backend.invoices.dto;

import java.util.List;

public record DashboardSummaryResponse(
    long totalInvoices,
    long pendingApprovals,
    long approvedInvoices,
    long rejectedInvoices,
    long draftInvoices,
    List<InvoiceResponse> recentInvoices,
    List<InvoiceResponse> pendingApprovalInvoices
) {}
