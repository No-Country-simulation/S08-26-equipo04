package com.backend.qualititrack.security.config;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.backend.qualititrack.utils.jwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtTokenValidator extends OncePerRequestFilter {
    private final jwtUtils jwtUtils;

    public JwtTokenValidator(jwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String jwtToken = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (jwtToken != null && jwtToken.startsWith("Bearer ")) {
            jwtToken = jwtToken.substring(7); // Quitar "Bearer "

            try {
                DecodedJWT decodedJWT = jwtUtils.validateToken(jwtToken);

                String username = jwtUtils.extractUsername(decodedJWT);
                
                // ✅ DEBUG: Imprimir el claim de autoridades
                String stringAuthorities = jwtUtils.getSpecificClaim(decodedJWT, "authorities");
                System.out.println("═══════════════════════════════════════════════════════════");
                System.out.println("🔐 JWT VALIDADO");
                System.out.println("📧 Username: " + username);
                System.out.println("🔑 Authorities (raw): " + stringAuthorities);
                System.out.println("═══════════════════════════════════════════════════════════");

                // Cargar autoridades en el contexto de seguridad
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        AuthorityUtils.commaSeparatedStringToAuthorityList(stringAuthorities)
                );
                
                // ✅ DEBUG: Imprimir las autoridades parseadas
                System.out.println("✅ Authorities después de parse: " + authentication.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // Si falla el token, limpiamos el contexto para asegurar que no pase
                System.out.println("❌ Error validando JWT: " + e.getMessage());
                e.printStackTrace();
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("⚠️ No hay token en la solicitud");
        }

        filterChain.doFilter(request, response);
    }
}
