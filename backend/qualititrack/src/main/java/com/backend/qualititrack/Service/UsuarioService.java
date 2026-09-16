package com.backend.qualititrack.Service;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.UsuarioDTO;
import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.UsuarioRepository;

@Service
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
        dto.setCreatedAt(usuario.getCreatedAt());
        dto.setUpdatedAt(usuario.getUpdatedAt());
        return dto;
    }

    // ================== MÉTODOS OBSOLETOS ==================
    // No se solicitan en el MVP actual (por ej. el ABM de usuarios se hace a mano en la BD)
    // Quedan comentados por si se requieren en el futuro.

    // ================== CREAR ==================

    /**
     * Crea un nuevo usuario.
     * - Valida que email no exista
     * - Hashea password
     * - Asigna rol OPERARIO por defecto
     */
    // public UsuarioDTO crear(UsuarioDTO dto) {
    //     log.info("Creando usuario con email: {}", dto.getEmail());

    //     // 1. Validar que email no exista (ÚNICO)
    //     if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
    //         log.warn("Email ya registrado: {}", dto.getEmail());
    //         throw new IllegalArgumentException("El email " + dto.getEmail() + " ya está registrado");
    //     }

    //     // 2. Convertir DTO → Entity
    //     Usuario usuario = new Usuario();
    //     usuario.setNombre(dto.getNombre());
    //     usuario.setEmail(dto.getEmail());
    //     usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));  // ✅ Hash BCrypt

    //     // 3. Asignar rol (si viene en el DTO, usar ese; sino, OPERARIO por defecto)
    //     if (dto.getRol() != null) {
    //         usuario.setRol(dto.getRol());
    //     } else {
    //         usuario.setRol(NivelRol.OPERARIO);  // ✅ Rol por defecto como ENUM
    //     }

    //     usuario.setActivo(true);

    //     // 4. Guardar en BD
    //     Usuario guardado = usuarioRepository.save(usuario);
    //     log.info("Usuario creado exitosamente: {}", guardado.getId());

    //     // 5. Convertir Entity → DTO y retornar
    //     return convertirADTO(guardado);
    // }

    /**
     * Actualiza un usuario existente.
     * - NO permite cambiar email (es único)
     * - Permite cambiar nombre y rol
     */
    // public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
    //     log.info("Actualizando usuario: {}", id);

    //     Usuario usuario = usuarioRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

    //     usuario.setNombre(dto.getNombre());
    //     usuario.setActivo(dto.getActivo());

    //     if (dto.getRol() != null) {
    //         usuario.setRol(dto.getRol());
    //     }

    //     Usuario actualizado = usuarioRepository.save(usuario);
    //     log.info("Usuario actualizado: {}", id);

    //     return convertirADTO(actualizado);
    // }

    /**
     * Cambia la contraseña de un usuario.
     */
    // public void cambiarPassword(Long id, String passwordActual, String passwordNueva) {
    //     log.info("Cambiando password del usuario: {}", id);

    //     Usuario usuario = usuarioRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

    //     // Validar password actual
    //     if (!passwordEncoder.matches(passwordActual, usuario.getPasswordHash())) {
    //         log.warn("Password actual incorrecta para usuario: {}", id);
    //         throw new IllegalArgumentException("La contraseña actual es incorrecta");
    //     }

    //     // Cambiar password
    //     usuario.setPasswordHash(passwordEncoder.encode(passwordNueva));
    //     usuarioRepository.save(usuario);

    //     log.info("Password cambiado para usuario: {}", id);
    // }

    // ================== ELIMINAR ==================

    /**
     * Desactiva un usuario (soft delete).
     */
    // public void desactivar(Long id) {
    //     log.info("Desactivando usuario: {}", id);

    //     Usuario usuario = usuarioRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

    //     usuario.setActivo(false);
    //     usuarioRepository.save(usuario);

    //     log.info("Usuario desactivado: {}", id);
    // }

    /**
     * Elimina un usuario (físicamente - usar con cuidado).
     */
    // public void eliminar(Long id) {
    //     log.info("Eliminando usuario: {}", id);

    //     usuarioRepository.deleteById(id);

    //     log.info("Usuario eliminado: {}", id);
    // }
}