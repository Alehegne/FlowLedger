
package com.example.flowLedger_backend;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
class DatabaseMigrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
        new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("flowledger_migration_test")
            .withUsername("test")
            .withPassword("test");

    @Test
    void migrationsRunSuccessfullyOnCleanDatabase() {
        Flyway flyway = Flyway.configure()
            .dataSource(
                POSTGRES.getJdbcUrl(),
                POSTGRES.getUsername(),
                POSTGRES.getPassword()
            )
            .locations("classpath:db/migration")
            .load();

        var result = flyway.migrate();

        assertThat(result.migrationsExecuted).isPositive();
        assertThat(flyway.info().applied()).isNotEmpty();
 
        flyway.validate();
    }
}
