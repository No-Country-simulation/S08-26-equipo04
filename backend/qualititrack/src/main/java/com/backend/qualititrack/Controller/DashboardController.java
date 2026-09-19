package com.backend.qualititrack.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.DashboardCalidadResponseDTO;
import com.backend.qualititrack.Service.DashboardService; // O el servicio donde centralices la lógica

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * DASHBOARD DE CALIDAD - GET /api/dashboard/calidad
     * Accesible para Gerencia / Calidad (ajusta los roles según los requerimientos
     * de seguridad)
     */
    @GetMapping("/calidad")
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION', 'CALIDAD')")
    public ResponseEntity<DashboardCalidadResponseDTO> obtenerDashboardCalidad() {
        DashboardCalidadResponseDTO dashboard = dashboardService.obtenerMetricasCalidad();
        return ResponseEntity.ok().body(dashboard);
    }
}