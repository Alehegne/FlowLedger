package com.example.flowLedger_backend.identity;

import com.example.flowLedger_backend.PostgresIntegrationTestBase;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthIntegrationTest extends PostgresIntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void login_withValidCredentials_returns200AndSetsCookieAndReturnsToken() throws Exception {
        String requestJson = """
                {
                    "email": "abebe@acme.co",
                    "password": "password"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().httpOnly("access_token", true))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("abebe@acme.co"))
                .andExpect(jsonPath("$.user.fullName").value("Abebe Girma"))
                .andExpect(jsonPath("$.organization.name").value("Acme Trading Co."))
                .andExpect(jsonPath("$.organization.role").value("OWNER"));
    }

    @Test
    void login_withInvalidPassword_returns401() throws Exception {
        String requestJson = """
                {
                    "email": "abebe@acme.co",
                    "password": "wrong-password"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void login_withUnknownUser_returns401() throws Exception {
        String requestJson = """
                {
                    "email": "unknown@acme.co",
                    "password": "password"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withCookie_returnsCurrentSession() throws Exception {
        // 1. Login to obtain access_token cookie
        String requestJson = """
                {
                    "email": "abebe@acme.co",
                    "password": "password"
                }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("access_token");
        assertThat(authCookie).isNotNull();

        // 2. Request /api/v1/me using the cookie
        mockMvc.perform(get("/api/v1/me")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("abebe@acme.co"))
                .andExpect(jsonPath("$.user.name").value("Abebe Girma"))
                .andExpect(jsonPath("$.organization.name").value("Acme Trading Co."))
                .andExpect(jsonPath("$.organization.role").value("OWNER"))
                .andExpect(jsonPath("$.permissions").isArray());
    }

    @Test
    void me_withBearerHeader_returnsCurrentSession() throws Exception {
        // 1. Login to get token string
        String requestJson = """
                {
                    "email": "abebe@acme.co",
                    "password": "password"
                }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("access_token");
        assertThat(authCookie).isNotNull();
        String token = authCookie.getValue();

        // 2. Request /api/v1/me using Authorization: Bearer <token>
        mockMvc.perform(get("/api/v1/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("abebe@acme.co"))
                .andExpect(jsonPath("$.organization.name").value("Acme Trading Co."));
    }

    @Test
    void me_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_clearsCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("access_token", 0))
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}
