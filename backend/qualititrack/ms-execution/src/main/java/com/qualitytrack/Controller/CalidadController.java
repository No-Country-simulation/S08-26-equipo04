package com.qualitytrack.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qualitytrack.DTO.AuditoriaDetalleDTO;
import com.qualitytrack.DTO.CalidadConformidadDTO;
import com.qualitytrack.DTO.CalidadResponseDTO;
import com.qualitytrack.DTO.OrdenTrabajoDTO;
import com.qualitytrack.Enum.ResultadoCalidad;
import com.qualitytrack.Service.CalidadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/calidad")
public class CalidadController {

    private final CalidadService calidadService;

    public CalidadController(CalidadService calidadService) {
        this.calidadService = calidadService;
    }

    /**
     * Obtiene las órdenes de trabajo pendientes de auditoría.
     *
     * 
     * Solo los usuarios con rol CALIDAD pueden acceder.
     */
    @GetMapping
    @PreAuthorize("hasRole('CALIDAD')")
    public ResponseEntity<List<OrdenTrabajoDTO>> listarPendientesAuditoria() {
        return ResponseEntity.ok(calidadService.listarPendientesAuditoria());
    }

    /**
     * GET /api/calidad/{id}/ultima-auditoria
     * Busca la última auditoría de la OT.
     * 
     * Roles: Calidad, Jefe de Producción o Vendedor
     */
    @GetMapping("/{ordenTrabajoId}/ultima-auditoria")
    @PreAuthorize("hasAnyRole('CALIDAD', 'JEFE_PRODUCCION', 'VENDEDOR')")
    public ResponseEntity<AuditoriaDetalleDTO> obtenerUltimaAuditoria(@PathVariable Long ordenTrabajoId) {
        return ResponseEntity.ok(calidadService.obtenerUltimaAuditoria(ordenTrabajoId));
    }

    /**
     * POST /api/calidad/{id}/conforme
     * Marca OT como CONFORME
     * Solo CALIDAD
     */
    @PostMapping("/{id}/conforme")
    @PreAuthorize("hasRole('CALIDAD')")
    public ResponseEntity<CalidadResponseDTO> marcarConforme(
            @PathVariable Long id,
            @Valid @RequestBody CalidadConformidadDTO dto,
            Authentication auth) {
        CalidadResponseDTO respuesta = calidadService.marcarConforme(id, dto, auth.getName(),
                ResultadoCalidad.CONFORME);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    /**
     * POST /api/calidad/{id}/no-conforme
     * Marca OT como NO_CONFORME
     * Solo CALIDAD
     */
    @PostMapping("/{id}/no-conforme")
    @PreAuthorize("hasRole('CALIDAD')")
    public ResponseEntity<CalidadResponseDTO> marcarNoConforme(
            @PathVariable Long id,
            @Valid @RequestBody CalidadConformidadDTO dto,
            Authentication auth) {
        CalidadResponseDTO respuesta = calidadService.marcarConforme(id, dto, auth.getName(),
                ResultadoCalidad.NO_CONFORME);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
}