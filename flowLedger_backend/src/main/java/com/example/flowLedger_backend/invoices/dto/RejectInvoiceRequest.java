package com.example.flowLedger_backend.invoices.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectInvoiceRequest(
    @NotBlank(message = "Rejection reason is required")
    String reason
) {}
