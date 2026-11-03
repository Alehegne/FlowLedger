package com.example.flowLedger_backend.identity.dto;

import java.util.UUID;

public record UserSummary(
    UUID id,
    String email,
    String fullName
) {}
