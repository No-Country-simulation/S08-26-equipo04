package com.backend.qualititrack.Controller;

import com.backend.qualititrack.DTO.UsuarioDTO;
import com.backend.qualititrack.Service.UsuarioService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/usuarios")
@Slf4j
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    // ================== CREATE ==================

    /**
     * POST /api/usuarios
     * Crea un nuevo usuario.
     *
     * Ejemplo de request:
     * {
     *   "nombre": "Juan Pérez",
     *   "email": "juan@example.com",
     *   "password": "MiPassword123"
     * }
     *
     * Response: 201 Created
     * {
     *   "id": 1,
     *   "nombre": "Juan Pérez",
     *   "email": "juan@example.com",
     *   "rol": "OPERARIO",
     *   "activo": true,
     *   "fechaCreacion": "2024-09-03T10:30:00"
     * }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<UsuarioDTO> crear(@RequestBody @Valid UsuarioDTO dto) {
        log.info("POST /api/usuarios - Creando usuario: {}", dto.getEmail());

        UsuarioDTO creado = usuarioService.crear(dto);

        // HTTP 201 Created (recurso creado exitosamente)
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // ================== READ ==================

    /**
     * GET /api/usuarios
     * Lista todos los usuarios (activos e inactivos).
     *
     * Response: 200 OK
     * [
     *   { "id": 1, "nombre": "Juan", "email": "juan@example.com", ... },
     *   { "id": 2, "nombre": "María", "email": "maria@example.com", ... }
     * ]
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        log.info("GET /api/usuarios - Listando todos los usuarios");

        List<UsuarioDTO> usuarios = usuarioService.listarTodos();

        // HTTP 200 OK
        return ResponseEntity.ok(usuarios);
    }

    /**
     * GET /api/usuarios/activos
     * Lista solo usuarios activos.
     *
     * Response: 200 OK
     * [...]
     */
    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('GERENTE')")
    public ResponseEntity<List<UsuarioDTO>> listarActivos() {
        log.info("GET /api/usuarios/activos - Listando usuarios activos");

        List<UsuarioDTO> usuarios = usuarioService.listarActivos();

        // HTTP 200 OK
        return ResponseEntity.ok(usuarios);
    }

    /**
     * GET /api/usuarios/{id}
     * Obtiene un usuario por su ID.
     *
     * URL: /api/usuarios/1
     *
     * Response: 200 OK
     * {
     *   "id": 1,
     *   "nombre": "Juan",
     *   "email": "juan@example.com",
     *   "rol": "OPERARIO",
     *   "activo": true,
     *   "fechaCreacion": "2024-09-03T10:30:00"
     * }
     *
     * Si no existe:
     * Response: 404 Not Found
     * {
     *   "error": "Usuario con ID 999 no encontrado"
     * }
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/usuarios/{} - Obteniendo usuario", id);

        UsuarioDTO usuario = usuarioService.obtenerPorId(id);

        // HTTP 200 OK
        return ResponseEntity.ok(usuario);
    }

    /**
     * GET /api/usuarios/email/{email}
     * Obtiene un usuario por su email.
     *
     * URL: /api/usuarios/email/juan@example.com
     *
     * Response: 200 OK
     * {...}
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<UsuarioDTO> obtenerPorEmail(@PathVariable String email) {
        log.info("GET /api/usuarios/email/{} - Obteniendo usuario", email);

        UsuarioDTO usuario = usuarioService.obtenerPorEmail(email);

        // HTTP 200 OK
        return ResponseEntity.ok(usuario);
    }

    // ================== UPDATE ==================

    /**
     * PUT /api/usuarios/{id}
     * Actualiza un usuario existente.
     *
     * URL: /api/usuarios/1
     *
     * Request body:
     * {
     *   "nombre": "Juan Actualizado",
     *   "email": "juan@example.com",
     *   "rol": "GERENTE",
     *   "activo": true
     * }
     *
     * Response: 200 OK
     * {
     *   "id": 1,
     *   "nombre": "Juan Actualizado",
     *   ...
     * }
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<UsuarioDTO> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioDTO dto) {
        log.info("PUT /api/usuarios/{} - Actualizando usuario", id);

        UsuarioDTO actualizado = usuarioService.actualizar(id, dto);

        // HTTP 200 OK
        return ResponseEntity.ok(actualizado);
    }

    /**
     * PUT /api/usuarios/{id}/password
     * Cambia la contraseña de un usuario.
     *
     * URL: /api/usuarios/1/password
     *
     * Request body:
     * {
     *   "passwordActual": "MiPasswordAnterior123",
     *   "passwordNueva": "MiPasswordNuevo456"
     * }
     *
     * Response: 200 OK (sin body)
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<Void> cambiarPassword(
            @PathVariable Long id,
            @RequestParam String passwordActual,
            @RequestParam String passwordNueva) {
        log.info("PUT /api/usuarios/{}/password - Cambiando password", id);

        usuarioService.cambiarPassword(id, passwordActual, passwordNueva);

        // HTTP 200 OK (sin contenido)
        return ResponseEntity.ok().build();
    }

    // ================== DELETE ==================

    /**
     * DELETE /api/usuarios/{id}
     * Desactiva un usuario (no lo elimina físicamente).
     *
     * URL: /api/usuarios/1
     *
     * Response: 204 No Content (sin body, solo éxito)
     *
     * Si no existe:
     * Response: 404 Not Found
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        log.info("DELETE /api/usuarios/{} - Desactivando usuario", id);

        usuarioService.desactivar(id);

        // HTTP 204 No Content (éxito, sin body)
        return ResponseEntity.noContent().build();
    }

    // ================== LÓGICA DE NEGOCIO ==================

    /**
     * GET /api/usuarios/{id}/permisos/crear-fases
     * Verifica si un usuario puede crear fases.
     *
     * URL: /api/usuarios/1/permisos/crear-fases
     *
     * Response: 200 OK
     * {
     *   "usuarioId": 1,
     *   "permiso": "crear-fases",
     *   "tiene": true
     * }
     */
    @GetMapping("/{id}/permisos/crear-fases")
    public ResponseEntity<Boolean> puedeCrearFases(@PathVariable Long id) {
        log.info("GET /api/usuarios/{}/permisos/crear-fases", id);

        boolean puede = usuarioService.puedeCrearFases(id);

        return ResponseEntity.ok(puede);
    }

    /**
     * GET /api/usuarios/{id}/permisos/ejecutar-fase
     * Verifica si un usuario puede ejecutar fases.
     *
     * Response: 200 OK
     * true / false
     */
    @GetMapping("/{id}/permisos/ejecutar-fase")
    public ResponseEntity<Boolean> puedeEjecutarFase(@PathVariable Long id) {
        log.info("GET /api/usuarios/{}/permisos/ejecutar-fase", id);

        boolean puede = usuarioService.puedeEjecutarFase(id);

        return ResponseEntity.ok(puede);
    }

    /**
     * GET /api/usuarios/{id}/permisos/verificar-calidad
     * Verifica si un usuario puede verificar calidad.
     */
    @GetMapping("/{id}/permisos/verificar-calidad")
    public ResponseEntity<Boolean> puedeVerificarCalidad(@PathVariable Long id) {
        log.info("GET /api/usuarios/{}/permisos/verificar-calidad", id);

        boolean puede = usuarioService.puedeVerificarCalidad(id);

        return ResponseEntity.ok(puede);
    }

    /**
     * GET /api/usuarios/{id}/permisos/crear-cotizacion
     * Verifica si un usuario puede crear cotizaciones.
     */
    @GetMapping("/{id}/permisos/crear-cotizacion")
    public ResponseEntity<Boolean> puedeCrearCotizacion(@PathVariable Long id) {
        log.info("GET /api/usuarios/{}/permisos/crear-cotizacion", id);

        boolean puede = usuarioService.puedeCrearCotizacion(id);

        return ResponseEntity.ok(puede);
    }
}
