package com.example.flowLedger_backend.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, OrganizationMembershipId> {

    List<OrganizationMembership> findByUserId(UUID userId);

    Optional<OrganizationMembership> findFirstByUserId(UUID userId);

    List<OrganizationMembership> findByOrganizationId(UUID organizationId);
}
