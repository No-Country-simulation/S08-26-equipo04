package com.qualitytrack.Controller;

import com.qualitytrack.Service.OrdenTrabajoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-trabajo")
public class OrdenTrabajoController {
    
    @Autowired
    private OrdenTrabajoService ordenTrabajoService;
    
    @PostMapping("/generar")
    public ResponseEntity<?> generarDesdeCotzacion(@RequestParam Long cotizacionId) {
        try {
            ordenTrabajoService.generarDesdeCotzacion(cotizacionId);
            return ResponseEntity.ok("Orden de trabajo generada");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
