package com.backend.qualititrack.Controller;

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

import com.backend.qualititrack.DTO.CalidadConformidadDTO;
import com.backend.qualititrack.DTO.CalidadResponseDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.Service.CalidadService;

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
     * POST /api/calidad/{id}/conforme
     * Marca OT como CONFORME
     * Solo CALIDAD
     */
    @PostMapping("/{id}/conforme")
    @PreAuthorize("hasRole('CALIDAD')")
    public ResponseEntity<CalidadResponseDTO> marcarConforme(
            @PathVariable Long id,
            @Valid @RequestBody CalidadConformidadDTO dto,
            Authentication authentication) {

        String emailAuditor = authentication.getName(); // Extrae email del JWT
        CalidadResponseDTO respuesta = calidadService.marcarConforme(id, dto, emailAuditor);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        /*
         * Usuario auditor = new Usuario();
         * auditor.setEmail(authentication.getName());
         * 
         * CalidadResponseDTO response = calidadService.marcarConforme(id, dto,
         * String.valueOf(auditor));
         * return ResponseEntity.status(HttpStatus.CREATED).body(response);
         */
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
            Authentication authentication) {

        /*
         * Usuario auditor = new Usuario();
         * auditor.setEmail(authentication.getName());
         * 
         * CalidadResponseDTO response = calidadService.marcarNoConforme(id, dto,
         * String.valueOf(auditor));
         * return ResponseEntity.status(HttpStatus.CREATED).body(response);
         */
        String emailAuditor = authentication.getName(); // Extrae email del JWT
        CalidadResponseDTO respuesta = calidadService.marcarNoConforme(id, dto, emailAuditor);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
}