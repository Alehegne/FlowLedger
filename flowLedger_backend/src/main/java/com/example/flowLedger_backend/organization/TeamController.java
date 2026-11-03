package com.example.flowLedger_backend.organization;

import com.example.flowLedger_backend.organization.dto.TeamMemberResponse;
import com.example.flowLedger_backend.security.AuthenticatedUserContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class TeamController {

    private final OrganizationMembershipRepository membershipRepository;
    private final AuthenticatedUserContext userContextResolver;

    public TeamController(OrganizationMembershipRepository membershipRepository,
                          AuthenticatedUserContext userContextResolver) {
        this.membershipRepository = membershipRepository;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping("/team")
    public ResponseEntity<List<TeamMemberResponse>> listTeamMembers(Authentication authentication) {
        var context = userContextResolver.resolve(authentication);
        List<OrganizationMembership> memberships = membershipRepository.findByOrganizationId(context.organizationId());

        List<TeamMemberResponse> response = memberships.stream()
                .map(m -> new TeamMemberResponse(
                        m.getUser().getId(),
                        m.getUser().getFullName(),
                        m.getUser().getEmail(),
                        m.getRole(),
                        m.getUser().isEnabled() ? "ACTIVE" : "SUSPENDED"
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
}
