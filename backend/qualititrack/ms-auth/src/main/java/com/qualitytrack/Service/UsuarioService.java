package com.qualitytrack.Service;
import java.util.List;
import java.util.stream.Collectors;

import com.qualitytrack.DTO.UsuarioDTO;
import com.qualitytrack.Enum.NivelRol;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



@Service
@Slf4j
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    // ================== LEER ==================

    /**
     * Obtiene un usuario por ID.
     */
    public UsuarioDTO obtenerPorId(Long id) {
        log.info("Obteniendo usuario con ID: {}", id);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado: {}", id);
                    return new RuntimeException("Usuario con ID " + id + " no encontrado");
                });

        return convertirADTO(usuario);
    }

    /**
     * Obtiene un usuario por email.
     */
    public UsuarioDTO obtenerPorEmail(String email) {
        log.info("Obteniendo usuario con email: {}", email);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado: {}", email);
                    return new RuntimeException("Usuario con email " + email + " no encontrado");
                });

        return convertirADTO(usuario);
    }

    /**
     * Lista todos los usuarios activos.
     */
    public List<UsuarioDTO> listarActivos() {
        log.info("Listando usuarios activos");

        return usuarioRepository.findByActivo(true)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los usuarios.
     */
    public List<UsuarioDTO> listarTodos() {
        log.info("Listando todos los usuarios");

        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene usuarios por rol (directamente como ENUM).
     * Ahora es más simple: filtra por NivelRol enum.
     */
    public List<UsuarioDTO> obtenerPorRol(NivelRol rol) {
        log.info("Obteniendo usuarios por rol: {}", rol);

        return usuarioRepository.findByRolAndActivo(rol, true)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // ================== CREAR ==================

    /**
     * Crea un nuevo usuario con contraseña hasheada.
     */
    public Usuario crear(String email, String nombre, String password, NivelRol rol) {
        log.info("Creando nuevo usuario: {}", email);

        if (usuarioRepository.findByEmail(email).isPresent()) {
            log.warn("Email ya registrado: {}", email);
            throw new RuntimeException("El email " + email + " ya está registrado");
        }

        String passwordHasheada = passwordEncoder.encode(password);

        /*Usuario nuevoUsuario = Usuario.builder()
                .email(email)
                .nombre(nombre)
                .passwordHash(passwordHasheada)
                .rol(rol)
                .activo(true)
                .build();*/
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setNombre(nombre);
        nuevoUsuario.setPasswordHash(passwordHasheada);
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        log.info("Usuario creado: {} con ID: {}", email, guardado.getId());
        return guardado;
    }

    // ================== LÓGICA DE NEGOCIO ==================
    // NOTA: ESTOS METODOS NO SON NECESARIOS, SE RESOLVERIAN CON PREAUTHORIZE!!!!!!!!!!!

    /**
     * Verifica si un usuario tiene permiso para crear fases.
     * Solo GERENTE puede crear fases.
     */
    public boolean puedeCrearFases(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getRol() == NivelRol.GERENTE;
    }

    /**
     * Verifica si un usuario tiene permiso para ejecutar fases.
     * Solo OPERARIO puede ejecutar fases.
     * ESTE MÉTODO NO ES CORRECTO
     */
    public boolean puedeEjecutarFase(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getRol() == NivelRol.OPERARIO;
    }

    /**
     * Verifica si un usuario tiene permiso para verificar calidad.
     * Solo CALIDAD puede verificar.
     */
    public boolean puedeVerificarCalidad(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getRol() == NivelRol.CALIDAD;
    }

    /**
     * Verifica si un usuario puede crear cotizaciones.
     * Solo JEFE_PRODUCCION puede crear.
     */
    public boolean puedeCrearCotizacion(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getRol() == NivelRol.JEFE_PRODUCCION;
    }

    // ================== CONVERTERS ==================

    /**
     * Convierte Entity → DTO
     * ✅ Incluye: id, nombre, email, rol, activo, fechas
     * ❌ NO incluye: password (seguridad)
     */
    private UsuarioDTO convertirADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        dto.setActivo(usuario.getActivo());
        //dto.setCreatedAt(usuario.getCreatedAt());
       //dto.setUpdatedAt(usuario.getUpdatedAt());
        return dto;
    }



}