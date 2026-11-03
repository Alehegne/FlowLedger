package com.example.flowLedger_backend.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.flowLedger_backend.PostgresIntegrationTestBase;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;


// uuid
import java.util.UUID;

public class IdentityRepositoryTest extends PostgresIntegrationTestBase {


    @Autowired 
    private IdentityRepository identityRepository;

    @Test 
    public void checkingIdentityRepositoryTest() {
        System.out.println("IdentityRepositoryTest is running");
    }
    
    @Test 
    public void createAppUserTest() {



        AppUser appUser = createSampleAppUser();
        

        AppUser savedUser = identityRepository.saveAndFlush(appUser);

        assertNotNull(savedUser);
        assertTrue(savedUser.getId().equals(appUser.getId()));


    }
    @Test 
    public void findAppUserByIdTest() {
        AppUser appUser = createSampleAppUser();

        AppUser savedUser = identityRepository.saveAndFlush(appUser);

        assertNotNull(savedUser);
        assertTrue(savedUser.getId().equals(appUser.getId()));

        // Now, let's try to find the user by ID
        UUID userId = savedUser.getId();
        AppUser foundUser = identityRepository.findById(userId).orElse(null);

        assertNotNull(foundUser);
        assertTrue(foundUser.getId().equals(userId));

    }
    @Test 
    public void deleteAppUserByIdTest() {
        AppUser appUser = createSampleAppUser();

        AppUser savedUser = identityRepository.saveAndFlush(appUser);

        assertNotNull(savedUser);
        assertTrue(savedUser.getId().equals(appUser.getId()));

        // Now, let's delete the user by ID
        UUID userId = savedUser.getId();
        identityRepository.deleteById(userId);

        // Verify that the user is deleted
        AppUser deletedUser = identityRepository.findById(userId).orElse(null);
        assertTrue(deletedUser == null);
    }
    @Test 
    public void updateAppUserTest() {
        AppUser appUser = createSampleAppUser();
        AppUser savedUser = identityRepository.saveAndFlush(appUser);
        assertNotNull(savedUser);
        assertTrue(savedUser.getId().equals(appUser.getId()));

        // Now, let's update the user's full name
        String newFullName = "Updated Alex";
        savedUser.setFullName(newFullName);
        AppUser updatedUser = identityRepository.saveAndFlush(savedUser);
        assertNotNull(updatedUser);
        assertTrue(updatedUser.getFullName().equals(newFullName));
    }

    private AppUser createSampleAppUser() {
         AppUser appUser = new AppUser();
         UUID uuid = UUID.randomUUID();
        appUser.setId(uuid);
        appUser.setEmail("alex" + uuid + "@gmail.com");
        appUser.setPasswordHash("hashed_password");
        appUser.setFullName("Alex");
        appUser.setEnabled(true);
        appUser.setCreatedAt(java.time.Instant.now());
        return appUser;
    }


}


/**
 * how to run this test:
 * ./mvnw test -Dtest=IdentityRepositoryTest test
 */