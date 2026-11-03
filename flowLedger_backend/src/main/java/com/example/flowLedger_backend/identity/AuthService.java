package com.example.flowLedger_backend.identity;

import com.example.flowLedger_backend.identity.dto.LoginRequest;
import com.example.flowLedger_backend.identity.dto.LoginResponse;
import com.example.flowLedger_backend.identity.dto.OrganizationSummary;
import com.example.flowLedger_backend.identity.dto.SessionResponse;
import com.example.flowLedger_backend.identity.dto.UserSummary;
import com.example.flowLedger_backend.organization.Organization;
import com.example.flowLedger_backend.organization.OrganizationMembership;
import com.example.flowLedger_backend.organization.OrganizationMembershipRepository;
import com.example.flowLedger_backend.security.CookieBearerTokenResolver;
import com.example.flowLedger_backend.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final IdentityRepository identityRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(IdentityRepository identityRepository,
                       OrganizationMembershipRepository membershipRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.identityRepository = identityRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        AppUser user = identityRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Resolve user's primary organization membership
        Optional<OrganizationMembership> membershipOpt = membershipRepository.findFirstByUserId(user.getId());

        UUID orgId = membershipOpt.map(m -> m.getOrganization().getId()).orElse(null);
        String orgName = membershipOpt.map(m -> m.getOrganization().getName()).orElse("Default Workspace");
        String role = membershipOpt.map(OrganizationMembership::getRole).orElse("VIEWER");

        // Generate JWT
        String accessToken = jwtService.generateAccessToken(user, orgId, role);

        // Set HttpOnly access_token cookie
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, accessToken)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtService.getExpiresInSeconds())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserSummary userSummary = new UserSummary(user.getId(), user.getEmail(), user.getFullName());
        OrganizationSummary orgSummary = new OrganizationSummary(orgId, orgName, role);

        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtService.getExpiresInSeconds(),
                userSummary,
                orgSummary
        );
    }

    public void logout(HttpServletResponse response) {
        // Clear HttpOnly access_token cookie
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Transactional(readOnly = true)
    public SessionResponse getCurrentSession(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new BadCredentialsException("Unauthenticated request");
        }

        String subject = jwt.getSubject();
        AppUser user = null;

        try {
            UUID userId = UUID.fromString(subject);
            user = identityRepository.findById(userId).orElse(null);
        } catch (IllegalArgumentException ignored) {
            // Subject might be email
        }

        if (user == null) {
            String email = jwt.getClaimAsString("email");
            if (email != null) {
                user = identityRepository.findByEmailIgnoreCase(email).orElse(null);
            }
        }

        if (user == null) {
            throw new BadCredentialsException("User identity not found");
        }

        Optional<OrganizationMembership> membershipOpt = membershipRepository.findFirstByUserId(user.getId());

        UUID orgId = membershipOpt.map(m -> m.getOrganization().getId()).orElse(null);
        String orgName = membershipOpt.map(m -> m.getOrganization().getName()).orElse("Default Workspace");
        String role = membershipOpt.map(OrganizationMembership::getRole).orElse("VIEWER");

        List<String> permissions = resolvePermissionsForRole(role);

        return new SessionResponse(
                new SessionResponse.UserSession(user.getId(), user.getFullName(), user.getEmail()),
                new OrganizationSummary(orgId, orgName, role),
                permissions
        );
    }

    private List<String> resolvePermissionsForRole(String role) {
        if (role == null) return List.of("invoices:read");
        return switch (role.toUpperCase()) {
            case "OWNER" -> List.of(
                    "invoices:read", "invoices:create", "invoices:approve", "invoices:delete",
                    "team:manage", "settings:manage"
            );
            case "ADMIN" -> List.of(
                    "invoices:read", "invoices:create", "invoices:approve", "team:manage"
            );
            case "APPROVER" -> List.of(
                    "invoices:read", "invoices:approve"
            );
            case "FINANCE" -> List.of(
                    "invoices:read", "invoices:create"
            );
            default -> List.of("invoices:read");
        };
    }
}
