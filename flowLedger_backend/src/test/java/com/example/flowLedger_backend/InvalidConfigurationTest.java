
package com.example.flowLedger_backend;

import com.example.flowLedger_backend.config.LedgerProperties;
 
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import static org.assertj.core.api.Assertions.assertThat;
// Fail-Fast 
class InvalidConfigurationTest {

    private final ApplicationContextRunner contextRunner =
        new ApplicationContextRunner()
            .withConfiguration(
                AutoConfigurations.of(
                    ConfigurationPropertiesAutoConfiguration.class
                )
            )
            .withUserConfiguration(TestConfig.class);

    @Test
    void blankCurrencyCausesClearStartupFailure() {
        contextRunner
            .withPropertyValues("ledger.currency=")
            .run(context -> {
                assertThat(context).hasFailed();

                assertThat(context.getStartupFailure())
                    .hasStackTraceContaining("currency");
            });
    }

    @EnableConfigurationProperties(LedgerProperties.class)
    static class TestConfig {
    }
}
