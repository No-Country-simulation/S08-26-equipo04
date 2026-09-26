package com.qualitytrack.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qualitytrack.Service.FaseService;
import com.qualitytrack.modelos.FaseCatalogo;

@RestController
@RequestMapping("/api/fases")
public class FaseController {

    private final FaseService faseService;

    public FaseController(FaseService faseService) {
        this.faseService = faseService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION', 'OPERARIO')")
    public ResponseEntity<List<FaseCatalogo>> listarFases() {
        return ResponseEntity.ok(faseService.listarFases());
    }

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<FaseCatalogo> crearFase(@RequestBody FaseCatalogo fase) {
        FaseCatalogo nuevaFase = faseService.crearFase(fase);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaFase);
    }
}