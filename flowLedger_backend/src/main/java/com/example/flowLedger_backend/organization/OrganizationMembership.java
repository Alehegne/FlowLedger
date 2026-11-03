package com.example.flowLedger_backend.organization;

import com.example.flowLedger_backend.identity.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "organization_membership")
public class OrganizationMembership {

    @EmbeddedId
    private OrganizationMembershipId id = new OrganizationMembershipId();

    @ManyToOne(optional = false)
    @MapsId("organizationId")
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "role", nullable = false, length = 30)
    private String role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public OrganizationMembership() {
    }

    public OrganizationMembership(Organization organization, AppUser user, String role) {
        this.organization = organization;
        this.user = user;
        this.role = role;
        if (organization != null && organization.getId() != null) {
            this.id.setOrganizationId(organization.getId());
        }
        if (user != null && user.getId() != null) {
            this.id.setUserId(user.getId());
        }
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public OrganizationMembershipId getId() {
        return id;
    }

    public void setId(OrganizationMembershipId id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
        if (organization != null && organization.getId() != null) {
            this.id.setOrganizationId(organization.getId());
        }
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
        if (user != null && user.getId() != null) {
            this.id.setUserId(user.getId());
        }
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrganizationMembership that = (OrganizationMembership) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
