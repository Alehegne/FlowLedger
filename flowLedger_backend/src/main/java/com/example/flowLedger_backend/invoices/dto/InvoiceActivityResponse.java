package com.example.flowLedger_backend.invoices.dto;

import java.time.Instant;
import java.util.UUID;

public record InvoiceActivityResponse(
    UUID id,
    String type,
    String description,
    String actorName,
    Instant occurredAt
) {}
