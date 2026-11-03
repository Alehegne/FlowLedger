package com.example.flowLedger_backend.identity.dto;

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserSummary user,
    OrganizationSummary organization
) {}
