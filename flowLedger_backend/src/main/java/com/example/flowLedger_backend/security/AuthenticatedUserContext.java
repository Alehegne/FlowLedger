package com.example.flowLedger_backend.security;

import com.example.flowLedger_backend.identity.AppUser;
import com.example.flowLedger_backend.identity.IdentityRepository;
import com.example.flowLedger_backend.organization.OrganizationMembership;
import com.example.flowLedger_backend.organization.OrganizationMembershipRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthenticatedUserContext {

    private final IdentityRepository identityRepository;
    private final OrganizationMembershipRepository membershipRepository;

    public AuthenticatedUserContext(IdentityRepository identityRepository,
                                    OrganizationMembershipRepository membershipRepository) {
        this.identityRepository = identityRepository;
        this.membershipRepository = membershipRepository;
    }

    public record UserContext(
            UUID userId,
            String userName,
            String email,
            UUID organizationId,
            String role
    ) {}

    public UserContext resolve(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Unauthenticated request");
        }

        UUID userId;
        try {
            userId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException ex) {
            String email = jwt.getClaimAsString("email");
            AppUser u = identityRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new AccessDeniedException("User not found: " + email));
            userId = u.getId();
        }

        String name = jwt.getClaimAsString("name");
        String email = jwt.getClaimAsString("email");

        UUID orgId = null;
        String orgIdClaim = jwt.getClaimAsString("orgId");
        if (orgIdClaim != null && !orgIdClaim.isBlank()) {
            try {
                orgId = UUID.fromString(orgIdClaim);
            } catch (IllegalArgumentException ignored) {}
        }

        String role = jwt.getClaimAsString("role");

        if (orgId == null || role == null) {
            OrganizationMembership membership = membershipRepository.findFirstByUserId(userId)
                    .orElseThrow(() -> new AccessDeniedException("User has no organization memberships"));
            orgId = membership.getOrganization().getId();
            role = membership.getRole();
        }

        if (name == null || email == null) {
            AppUser user = identityRepository.findById(userId).orElse(null);
            if (user != null) {
                if (name == null) name = user.getFullName();
                if (email == null) email = user.getEmail();
            }
        }

        return new UserContext(userId, name != null ? name : "User", email != null ? email : "", orgId, role);
    }
}
