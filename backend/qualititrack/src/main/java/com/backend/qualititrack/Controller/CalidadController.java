package com.backend.qualititrack.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.Service.CalidadService;

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
     * Solo los usuarios con rol CALIDAD pueden acceder.
     */
    @GetMapping
    @PreAuthorize("hasRole('CALIDAD')")
    public ResponseEntity<List<OrdenTrabajoDTO>> listarPendientesAuditoria() {
        return ResponseEntity.ok(calidadService.listarPendientesAuditoria());
    }
}