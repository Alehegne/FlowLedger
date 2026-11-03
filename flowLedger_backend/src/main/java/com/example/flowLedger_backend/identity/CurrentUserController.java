package com.example.flowLedger_backend.identity;

import com.example.flowLedger_backend.identity.dto.SessionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CurrentUserController {

    private final AuthService authService;

    public CurrentUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<SessionResponse> getCurrentUser(Authentication authentication) {
        SessionResponse session = authService.getCurrentSession(authentication);
        return ResponseEntity.ok(session);
    }
}
