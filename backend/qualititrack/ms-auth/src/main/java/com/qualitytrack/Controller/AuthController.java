package com.qualitytrack.Controller;

import java.util.HashMap;
import java.util.Map;

import com.qualitytrack.DTO.LoginDTO;
import com.qualitytrack.DTO.RegisterDTO;
import com.qualitytrack.Enum.NivelRol;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import com.qualitytrack.Service.UsuarioService;
import com.qualitytrack.utils.jwtUtils;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos de autenticación.
 * - POST /api/auth/login: devuelve un JWT con el rol del usuario.
 * - POST /api/auth/register: alta pública, siempre con rol OPERARIO.
 *   La creación de usuarios con otros roles la hace un GERENTE vía POST /api/usuarios.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private static final NivelRol ROL_REGISTRO_PUBLICO = NivelRol.OPERARIO;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private jwtUtils jwtUtils;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
            );

            String jwtToken = jwtUtils.createToken(authentication);

            Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalStateException("Usuario no encontrado post-autenticación"));

            Map<String, String> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("rol", usuario.getRol().name());
            response.put("nombre", usuario.getNombre());
            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            log.info("Login fallido: credenciales inválidas");
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO) {
        if (registerDTO.getRol() != null
                && !registerDTO.getRol().isBlank()
                && !ROL_REGISTRO_PUBLICO.name().equalsIgnoreCase(registerDTO.getRol())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "El registro público solo crea usuarios OPERARIO. "
                    + "Otros roles los asigna un GERENTE desde /api/usuarios.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            Usuario nuevoUsuario = usuarioService.crear(
                    registerDTO.getEmail(),
                    registerDTO.getNombre(),
                    registerDTO.getPassword(),
                    ROL_REGISTRO_PUBLICO
            );

            Map<String, Object> response = new HashMap<>();
            response.put("id", nuevoUsuario.getId());
            response.put("email", nuevoUsuario.getEmail());
            response.put("nombre", nuevoUsuario.getNombre());
            response.put("rol", nuevoUsuario.getRol().name());
            response.put("mensaje", "Usuario registrado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            log.info("Registro rechazado: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }
}
