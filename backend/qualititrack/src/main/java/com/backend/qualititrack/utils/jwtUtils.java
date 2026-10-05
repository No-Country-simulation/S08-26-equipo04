package com.backend.qualititrack.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class jwtUtils {
    @Value("${security.jwt.private.key}")
    private String privateKey;

    @Value("${security.jwt.user.generator}")
    private String userGenerator;

    // 1. Generar el Token JWT
    public String createToken(Authentication authentication) {
        Algorithm algorithm = Algorithm.HMAC256(this.privateKey);

        // ✅ ARREGLO 1: Obtener el nombre de usuario correctamente
        // authentication.getName() retorna el username/email directamente (string)
        String username = authentication.getName();

        // ✅ ARREGLO 2: Filtrar SOLO las autoridades que comienzan con "ROLE_"
        // Esto evita incluir otras autoridades como "FACTOR_PASSWORD"
        String authorities = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))  // ← Filtro importante
                .collect(Collectors.joining(","));

        System.out.println("✅ JWT CREATION");
        System.out.println("📧 Username: " + username);
        System.out.println("🔑 Authorities: " + authorities);

        return JWT.create()
                .withIssuer(this.userGenerator)
                .withSubject(username)  // Ahora es solo el email
                .withClaim("authorities", authorities)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 1800000)) // 30 minutos
                .withJWTId(UUID.randomUUID().toString())
                .withNotBefore(new Date(System.currentTimeMillis()))
                .sign(algorithm);
    }

    // 2. Validar el Token JWT
    public DecodedJWT validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(this.privateKey);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(this.userGenerator)
                    .build();

            return verifier.verify(token);
        } catch (JWTVerificationException exception) {
            throw new JWTVerificationException("Token no válido o expirado.");
        }
    }

    // 3. Extraer el Username del Token
    public String extractUsername(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    // 4. Extraer un Claim específico
    public String getSpecificClaim(DecodedJWT decodedJWT, String claimName) {
        return decodedJWT.getClaim(claimName).asString();
    }

    // Método para obtener el claim
    public Claim extractClaim(DecodedJWT decodedJWT, String clainName) {
        return decodedJWT.getClaim(clainName);
    }

    // Obtener todos los claims
    public Map<String, Claim> getAllClaims(DecodedJWT decodedJWT) {
        return decodedJWT.getClaims();
    }
}
