package com.qualitytrack.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.qualitytrack.DTO.LoginDTO;
import com.qualitytrack.DTO.RegisterDTO;
import com.qualitytrack.Enum.NivelRol;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import com.qualitytrack.Service.UsuarioService;
import com.qualitytrack.utils.jwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired 
    private UsuarioRepository usuarioRepository;

    @Autowired
    private jwtUtils jwtUtils;

    @Autowired
    private UsuarioService usuarioService;

    /**
     * POST /auth/login
     * Autentica con email + password y retorna JWT token
     */
    @Autowired
    private Environment env;

    @GetMapping("/debug-db")
    public ResponseEntity<?> debugDB() {
        System.out.println("=== DATABASE CONNECTION DEBUG ===");
        System.out.println("Driver: " + env.getProperty("spring.datasource.driver-class-name"));
        System.out.println("URL: " + env.getProperty("spring.datasource.url"));
        System.out.println("User: " + env.getProperty("spring.datasource.username"));
        System.out.println("DB_HOST: " + env.getProperty("DB_HOST"));
        System.out.println("DB_NAME: " + env.getProperty("DB_NAME"));
        System.out.println("DB_USER: " + env.getProperty("DB_USER"));
        return ResponseEntity.ok("Check console");
    }

    @PostMapping("/test-bcrypt")
    @Transactional
    public ResponseEntity<?> testBcrypt(@RequestBody LoginDTO loginDTO) {
        System.out.println("\n=== TEST BCRYPT ===");
        System.out.println("Password recibido: " + loginDTO.getPassword());
        System.out.println("Longitud password: " + loginDTO.getPassword().length());

        Optional<Usuario> usuario = usuarioRepository.findByEmail(loginDTO.getEmail());
        if (usuario.isEmpty()) {
            return ResponseEntity.status(401).body("Usuario no encontrado");
        }

        String hashDB = usuario.get().getPasswordHash();
        System.out.println("Hash de BD: " + hashDB);
        System.out.println("Longitud hash: " + hashDB.length());

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean matches = encoder.matches(loginDTO.getPassword(), hashDB);

        System.out.println("¿Password matches?: " + matches);
        System.out.println("===================\n");

        return ResponseEntity.ok(Map.of("matches", matches, "hash", hashDB));
    }
    @PostMapping("/login")
    @Transactional
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

        /*} catch (AuthenticationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }*/
        } catch (AuthenticationException e) {
            System.out.println("❌ AuthenticationException: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        try {
            // Validar rol
            NivelRol rol;
            try {
                rol = NivelRol.valueOf(registerDTO.getRol().toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rol inválido. Roles válidos: GERENTE, OPERARIO, JEFE_PRODUCCION, CALIDAD");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Crear usuario
            Usuario nuevoUsuario = usuarioService.crear(
                registerDTO.getEmail(),
                registerDTO.getNombre(),
                registerDTO.getPassword(),
                rol
            );

            // Retornar respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("id", nuevoUsuario.getId());
            response.put("email", nuevoUsuario.getEmail());
            response.put("nombre", nuevoUsuario.getNombre());
            response.put("rol", nuevoUsuario.getRol().name());
            response.put("mensaje", "Usuario registrado exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            System.out.println("❌ Error en registro: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            System.out.println("❌ Error general: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al registrar usuario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
