package com.example.flowLedger_backend.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdentityRepository extends JpaRepository<AppUser, UUID> {

    /**
     * Finds a user by email ignoring case (aligns with the LOWER(email) unique index).
     */
    Optional<AppUser> findByEmailIgnoreCase(String email);

    /**
     * Checks if a user exists with the given email ignoring case.
     */
    boolean existsByEmailIgnoreCase(String email);
}
