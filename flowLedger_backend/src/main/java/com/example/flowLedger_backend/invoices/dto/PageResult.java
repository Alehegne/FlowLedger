package com.example.flowLedger_backend.invoices.dto;

import java.util.List;

public record PageResult<T>(
    List<T> items,
    int page,
    int size,
    long totalItems,
    int totalPages
) {}
