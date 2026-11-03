package com.example.flowLedger_backend.identity.dto;

import java.util.UUID;

public record OrganizationSummary(
    UUID id,
    String name,
    String role
) {}
