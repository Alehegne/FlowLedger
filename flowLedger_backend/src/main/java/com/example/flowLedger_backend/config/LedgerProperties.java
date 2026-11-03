
package com.example.flowLedger_backend.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "ledger")
public record LedgerProperties(
    @NotBlank String currency
) {}

/*
so, ledger.currency is a property that is required to be set in the application configuration (e.g., application.properties or application.yml) and cannot be blank. The @Validated annotation ensures that the validation constraints are enforced when the properties are bound to this record.
 */
