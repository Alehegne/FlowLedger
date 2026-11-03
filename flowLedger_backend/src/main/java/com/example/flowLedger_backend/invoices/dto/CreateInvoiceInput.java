package com.example.flowLedger_backend.invoices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateInvoiceInput(
    @NotBlank(message = "Supplier name is required")
    String supplierName,

    @NotBlank(message = "Invoice number is required")
    String invoiceNumber,

    @NotBlank(message = "Amount is required")
    @Pattern(regexp = "^\\d+(\\.\\d{1,4})?$", message = "Amount must be a valid positive number")
    String amount,

    String currency,

    @NotBlank(message = "Invoice date is required")
    String invoiceDate,

    String dueDate,

    String description
) {}
