package com.example.flowLedger_backend.identity.dto;

import java.util.List;
import java.util.UUID;

public record SessionResponse(
    UserSession user,
    OrganizationSummary organization,
    List<String> permissions
) {
    public record UserSession(
        UUID id,
        String name,
        String email
    ) {}
}
