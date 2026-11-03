package com.example.flowLedger_backend.security;

import com.example.flowLedger_backend.identity.AppUser;
import com.example.flowLedger_backend.identity.IdentityRepository;
import com.example.flowLedger_backend.organization.OrganizationMembership;
import com.example.flowLedger_backend.organization.OrganizationMembershipRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final IdentityRepository identityRepository;
    private final OrganizationMembershipRepository membershipRepository;

    public CustomUserDetailsService(IdentityRepository identityRepository,
                                    OrganizationMembershipRepository membershipRepository) {
        this.identityRepository = identityRepository;
        this.membershipRepository = membershipRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser appUser = identityRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        membershipRepository.findFirstByUserId(appUser.getId()).ifPresent(membership -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + membership.getRole()));
        });

        return User.builder()
                .username(appUser.getEmail())
                .password(appUser.getPasswordHash())
                .disabled(!appUser.isEnabled())
                .authorities(authorities)
                .build();
    }
}
