package com.backend.qualititrack.Controller;
import com.backend.qualititrack.DTO.CotizacionDTO;
import com.backend.qualititrack.Enum.EstadoCotizacion;
import com.backend.qualititrack.Service.CotizacionService;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionControlador {
    @Autowired
    private CotizacionService cotizacionService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * 1. CREAR COTIZACIÓN - POST /api/cotizaciones
     * Solo JEFE_PRODUCCION
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION')")
    public ResponseEntity<CotizacionDTO> crear(@RequestBody CotizacionDTO dto) {
        Long jefeId = obtenerIdDelUsuario();
        CotizacionDTO creada = cotizacionService.crear(dto, jefeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    /**
     * 2. OBTENER POR ID - GET /api/cotizaciones/{id}
     * JEFE_PRODUCCION, VENDEDOR, OPERARIO, CALIDAD
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'VENDEDOR', 'OPERARIO', 'CALIDAD')")
    public ResponseEntity<CotizacionDTO> obtenerPorId(@PathVariable Long id) {
        CotizacionDTO cotizacion = cotizacionService.obtenerPorId(id);
        return ResponseEntity.ok().body(cotizacion);
    }

    /**
     * 3. OBTENER POR SOLICITUD - GET /api/cotizaciones/solicitud/{solicitudId}
     * JEFE_PRODUCCION, VENDEDOR
     */
    @GetMapping("/solicitud/{solicitudId}")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'VENDEDOR')")
    public ResponseEntity<CotizacionDTO> obtenerPorSolicitud(@PathVariable Long solicitudId) {
        CotizacionDTO cotizacion = cotizacionService.obtenerPorSolicitud(solicitudId);
        return ResponseEntity.ok().body(cotizacion);
    }

    /**
     * 4. LISTAR PENDIENTES - GET /api/cotizaciones/pendientes
     * Solo JEFE_PRODUCCION
     */
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION')")
    public ResponseEntity<List<CotizacionDTO>> listarPendientes() {
        List<CotizacionDTO> pendientes = cotizacionService.listarPendientes();
        return ResponseEntity.ok().body(pendientes);
    }

    /**
     * 5. ENVIAR AL CLIENTE - PUT /api/cotizaciones/{id}/enviar-cliente
     * Solo VENDEDOR
     */
    @PutMapping("/{id}/enviar-cliente")
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<CotizacionDTO> enviarAlCliente(@PathVariable Long id) {
        Long vendedorId = obtenerIdDelUsuario();
        CotizacionDTO actualizada = cotizacionService.enviarAlCliente(id, vendedorId);
        return ResponseEntity.ok().body(actualizada);
    }

    /**
     * 6. APROBAR COTIZACIÓN - PUT /api/cotizaciones/{id}/aprobar
     * Solo VENDEDOR
     * ⚡ DISPARA: Generación automática de OrdenTrabajo
     */
    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<CotizacionDTO> aprobarCotizacion(@PathVariable Long id) {
        Long vendedorId = obtenerIdDelUsuario();
        CotizacionDTO actualizada = cotizacionService.aprobarCotizacion(id, vendedorId);
        return ResponseEntity.ok().body(actualizada);
    }

    /**
     * 7. RECHAZAR COTIZACIÓN - PUT /api/cotizaciones/{id}/rechazar
     * Solo VENDEDOR
     */
    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<CotizacionDTO> rechazarCotizacion(
            @PathVariable Long id,
            @RequestBody MotivoRechazoRequest request) {
        Long vendedorId = obtenerIdDelUsuario();
        CotizacionDTO actualizada = cotizacionService.rechazarCotizacion(id, request.getMotivo(), vendedorId);
        return ResponseEntity.ok().body(actualizada);
    }

    /**
     * Helper: Extrae el ID del usuario autenticado desde el JWT
     *
     * Este método busca el usuario en la BD usando su email (username)
     * y retorna su ID. Es necesario porque Spring Security no almacena
     * el ID en el token por defecto.
     */
    private Long obtenerIdDelUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // Email es el username

        // Aquí iría una llamada a UsuarioRepository para obtener el ID por email
        // Por ahora, esto es un placeholder que necesitas implementar
        // TODO: Implementar búsqueda de usuario por email

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return usuario.getId();
        //throw new RuntimeException("TODO: Implementar obtención del ID del usuario desde JWT");
    }

    /**
     * Clase interna para recibir el motivo del rechazo
     */
    public static class MotivoRechazoRequest {
        private String motivo;

        public String getMotivo() {
            return motivo;
        }

        public void setMotivo(String motivo) {
            this.motivo = motivo;
        }
    }
}
