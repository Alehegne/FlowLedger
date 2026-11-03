
package com.example.flowLedger_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest extends PostgresIntegrationTestBase {

    @Test
    void contextLoads() {
        // A successful context startup is the assertion.
    }
}
