package com.example.flowLedger_backend.organization.dto;

import java.util.UUID;

public record TeamMemberResponse(
    UUID id,
    String name,
    String email,
    String role,
    String status
) {}
