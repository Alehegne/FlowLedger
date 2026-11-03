package com.example.flowLedger_backend.security;

import com.example.flowLedger_backend.identity.AppUser;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class JwtService {

    public static final long TOKEN_VALIDITY_SECONDS = 3600L; // 1 hour

    private final JwtEncoder jwtEncoder;
    private final JwsHeader jwsHeader;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
    }

    public String generateAccessToken(AppUser user, UUID orgId, String role) {
        Instant now = Instant.now();

        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .subject(user.getId().toString())
                .issuer("flowledger-backend")
                .issuedAt(now)
                .expiresAt(now.plus(TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                .claim("email", user.getEmail())
                .claim("name", user.getFullName());

        if (orgId != null) {
            builder.claim("orgId", orgId.toString());
        }
        if (role != null) {
            builder.claim("role", role);
        }

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, builder.build())).getTokenValue();
    }

    public String generateAccessToken(String username) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(username)
                .issuer("flowledger-backend")
                .issuedAt(now)
                .expiresAt(now.plus(TOKEN_VALIDITY_SECONDS, ChronoUnit.SECONDS))
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public long getExpiresInSeconds() {
        return TOKEN_VALIDITY_SECONDS;
    }
}
