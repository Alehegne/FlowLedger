package com.example.flowLedger_backend;

import com.example.flowLedger_backend.config.JwtConfig;
import com.example.flowLedger_backend.config.SecurityConfig;
import com.example.flowLedger_backend.security.CookieBearerTokenResolver;
import com.example.flowLedger_backend.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TestController.class)
@Import({SecurityConfig.class, JwtConfig.class, CookieBearerTokenResolver.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void publicEndpoint_isPermittedWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/test/api/public/hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello, public!"));
    }

    @Test
    void protectedEndpoint_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/test/api/private/secret"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_allowsValidCredentials() throws Exception {
        UserDetails user = User.withUsername("user")
                .password(passwordEncoder.encode("password"))
                .roles("USER")
                .build();
        when(userDetailsService.loadUserByUsername("user")).thenReturn(user);

        mockMvc.perform(get("/test/api/private/secret")
                        .with(httpBasic("user", "password")))
                .andExpect(status().isOk())
                .andExpect(content().string("Secret!"));
    }
}
