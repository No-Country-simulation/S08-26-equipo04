package com.backend.qualititrack.Controller;

import com.backend.qualititrack.modelos.Fase;
import com.backend.qualititrack.Service.FaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fases")
public class FaseController {

    @Autowired
    private FaseService faseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION', 'OPERARIO')")
    public ResponseEntity<List<Fase>> listarFases() {
        return ResponseEntity.ok(faseService.listarFases());
    }

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Fase> crearFase(@RequestBody Fase fase) {
        Fase nuevaFase = faseService.crearFase(fase);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaFase);
    }
}