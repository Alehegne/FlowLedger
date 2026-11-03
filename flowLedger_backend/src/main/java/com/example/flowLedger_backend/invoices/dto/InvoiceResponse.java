package com.example.flowLedger_backend.invoices.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
    UUID id,
    String supplierName,
    String invoiceNumber,
    String amount,
    String currency,
    LocalDate invoiceDate,
    LocalDate dueDate,
    String description,
    String status,
    String rejectionReason,
    List<InvoiceActivityResponse> activities,
    Instant createdAt,
    Instant updatedAt
) {}
