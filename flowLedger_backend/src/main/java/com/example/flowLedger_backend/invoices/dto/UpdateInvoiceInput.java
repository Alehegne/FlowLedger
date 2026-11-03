package com.example.flowLedger_backend.invoices.dto;

public record UpdateInvoiceInput(
    String supplierName,
    String invoiceNumber,
    String amount,
    String currency,
    String invoiceDate,
    String dueDate,
    String description
) {}
