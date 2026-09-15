package com.backend.qualititrack.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Service.OrdenTrabajoService;

@RestController
@RequestMapping("/api/ordenes-trabajo")
public class OrdenTrabajoController {
    @Autowired
    private OrdenTrabajoService ordenTrabajoService;

    /**
     * OBTENER POR ID - GET /api/ordenes-trabajo/{id}
     * JEFE_PRODUCCION, OPERARIO, CALIDAD
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'OPERARIO', 'CALIDAD')")
    public ResponseEntity<OrdenTrabajoDTO> obtenerPorId(@PathVariable Long id) {
        OrdenTrabajoDTO orden = ordenTrabajoService.obtenerPorId(id);
        return ResponseEntity.ok().body(orden);
    }

    /**
     * OBTENER POR COTIZACIÓN - GET /api/ordenes-trabajo/cotizacion/{cotizacionId}
     * JEFE_PRODUCCION, OPERARIO, CALIDAD, VENDEDOR
     */
    @GetMapping("/cotizacion/{cotizacionId}")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'OPERARIO', 'CALIDAD', 'VENDEDOR')")
    public ResponseEntity<OrdenTrabajoDTO> obtenerPorCotizacion(@PathVariable Long cotizacionId) {
        OrdenTrabajoDTO orden = ordenTrabajoService.obtenerPorCotizacion(cotizacionId);
        return ResponseEntity.ok().body(orden);
    }

    /**
     * LISTAR POR ESTADO - GET /api/ordenes-trabajo?estado=PENDIENTE
     * JEFE_PRODUCCION, OPERARIO, CALIDAD
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'OPERARIO', 'CALIDAD')")
    public ResponseEntity<?> listarPorEstado(@RequestParam(required = false) EstadoOT estado) {
        if (estado != null) {
            return ResponseEntity.ok().body(ordenTrabajoService.listarPorEstado(estado));
        }
        return ResponseEntity.badRequest().body("El parámetro 'estado' es requerido");
    }

    /**
     * ACTUALIZAR ESTADO - PUT /api/ordenes-trabajo/{id}/estado
     * JEFE_PRODUCCION, OPERARIO
     */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION', 'OPERARIO')")
    public ResponseEntity<OrdenTrabajoDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoRequest request) {
        OrdenTrabajoDTO orden = ordenTrabajoService.actualizarEstado(id, request.getEstado());
        return ResponseEntity.ok().body(orden);
    }

    /**
     * CANCELAR - PUT /api/ordenes-trabajo/{id}/cancelar
     * Solo JEFE_PRODUCCION
     */
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION')")
    public ResponseEntity<OrdenTrabajoDTO> cancelar(
            @PathVariable Long id,
            @RequestBody CancelacionRequest request) {
        OrdenTrabajoDTO orden = ordenTrabajoService.cancelar(id, request.getMotivo());
        return ResponseEntity.ok().body(orden);
    }

    /**
     * Clase interna para actualizar estado
     */
    public static class ActualizarEstadoRequest {
        private EstadoOT estado;

        public EstadoOT getEstado() {
            return estado;
        }

        public void setEstado(EstadoOT estado) {
            this.estado = estado;
        }
    }

    /**
     * Clase interna para cancelación
     */
    public static class CancelacionRequest {
        private String motivo;

        public String getMotivo() {
            return motivo;
        }

        public void setMotivo(String motivo) {
            this.motivo = motivo;
        }
    }
}
