package com.example.flowLedger_backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordEncoderTest {

    @Test
    void testPasswordEncoding() {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        String encoded = encoder.encode("password");
        System.out.println("ENCODED_PASSWORD: " + encoded);
        assertThat(encoder.matches("password", encoded)).isTrue();
    }
}
