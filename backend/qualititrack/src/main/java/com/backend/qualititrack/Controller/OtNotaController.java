package com.backend.qualititrack.Controller;

import java.util.List;
import java.util.Map;

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

import com.backend.qualititrack.DTO.OtNotaRequestDTO;
import com.backend.qualititrack.DTO.OtNotaResponseDTO;
import com.backend.qualititrack.Service.OtNotaService;

@RestController
@RequestMapping("/api/ot-fases/{id}/notas")
public class OtNotaController {
    
    private final OtNotaService otNotaService;

    public OtNotaController(OtNotaService otNotaService) {
        this.otNotaService = otNotaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERARIO', 'JEFE_PRODUCCION')")
    public ResponseEntity<Map<String, List<OtNotaResponseDTO>>> listarNotasFase(@PathVariable Long id, Authentication auth) {
        Map<String, List<OtNotaResponseDTO>> notas = otNotaService.listarNotasFase(id, auth.getName());
        return ResponseEntity.ok(notas);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CALIDAD', 'JEFE_PRODUCCION')")
    public ResponseEntity<OtNotaResponseDTO> generarNotaFase(@PathVariable Long id, @RequestBody OtNotaRequestDTO dto, Authentication auth) {
        OtNotaResponseDTO nota = otNotaService.generarNotaFase(id, dto, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(nota);
    }
}
