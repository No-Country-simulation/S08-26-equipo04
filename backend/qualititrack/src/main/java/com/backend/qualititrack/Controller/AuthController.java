package com.backend.qualititrack.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.LoginDTO;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.UsuarioRepository;
import com.backend.qualititrack.utils.jwtUtils;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired 
    private UsuarioRepository usuarioRepository;

    @Autowired
    private jwtUtils jwtUtils;

    /**
     * POST /auth/login
     * Autentica con email + password y retorna JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            // 1. Intentar autenticar
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        loginDTO.getEmail(),
                        loginDTO.getPassword()
                    )
            );

            // 2. Generar JWT token con Authentication (incluye roles/autoridades)
            String jwtToken = jwtUtils.createToken(authentication);

            // 3. Buscar datos del usuario para armar la respuesta requerida
            Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado post-autenticación"));

            // 4. Retornar token
            Map<String, String> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("rol", usuario.getRol().name());
            response.put("nombre", usuario.getNombre());

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
