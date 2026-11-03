
package com.example.flowLedger_backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest 
@Testcontainers 
public abstract class PostgresIntegrationTestBase {

    static final PostgreSQLContainer<?> POSTGRES =
        new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("flowledger_test")
            .withUsername("test")
            .withPassword("test");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        registry.add(
            "spring.datasource.url",
            POSTGRES::getJdbcUrl
        );
        registry.add(
            "spring.datasource.username",
            POSTGRES::getUsername
        );
        registry.add(
            "spring.datasource.password",
            POSTGRES::getPassword
        );
    }
}
