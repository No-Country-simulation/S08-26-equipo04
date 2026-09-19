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

import com.backend.qualititrack.DTO.OtFaseResponseDTO;
import com.backend.qualititrack.DTO.RehacerFasesRequestDTO;
import com.backend.qualititrack.Service.OtFaseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ot-fases")
public class OtFaseController {

    private final OtFaseService otFaseService;

    public OtFaseController(OtFaseService otFaseService) {
        this.otFaseService = otFaseService;
    }

    // GET /api/ot-fases
    // Obtener lista de fases (Jefe? -> todas | Operario? -> las propias).
    // solo accesible a roles Operario y Jefe de Producción
    @GetMapping
    @PreAuthorize("hasAnyRole('OPERARIO', 'JEFE_PRODUCCION')")
    public ResponseEntity<List<OtFaseResponseDTO>> listarFasesOperario(Long operarioId, Authentication authentication) {
        // Obtenemos las authorities (roles) del usuario autenticado
        boolean esJefe = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_JEFE_PRODUCCION"));
        List<OtFaseResponseDTO> lista;

        // Jefe -> todas las fases
        if (esJefe) {
            lista = otFaseService.listarFases();
        }
        // Operario -> solo sus fases
        else {
            // Obtener mail del usuario actual para luego identificar su id en el servicio
            String operarioMail = authentication.getName();
            // Buscar fases del usuario actual en el servicio
            lista = otFaseService.listarFasesOperario(operarioMail);
        }

        // HTTP 201 Created (recurso creado exitosamente)
        return ResponseEntity.status(HttpStatus.CREATED).body(lista);
    }

    // POST /api/ot-fases/{id}/iniciar
    // Inicia la fase con id {id} (solo si es del operario autenticado)
    // solo accesible a rol Operario
    @PostMapping("/{id}/iniciar")
    @PreAuthorize("hasAnyRole('OPERARIO')")
    public ResponseEntity<OtFaseResponseDTO> iniciarFase(@PathVariable Long id, Authentication authentication) {
        OtFaseResponseDTO response = otFaseService.iniciarFase(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // POST /api/ot-fases/{id}/finalizar
    // Inicia la fase con id {id} (solo si es del operario autenticado)
    // solo accesible a rol Operario
    @PostMapping("/{id}/finalizar")
    @PreAuthorize("hasAnyRole('OPERARIO')")
    public ResponseEntity<OtFaseResponseDTO> finalizarFase(@PathVariable Long id, Authentication authentication) {
        OtFaseResponseDTO response = otFaseService.finalizarFase(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // POST /api/ot-fases
    // Crea nuevos registros de fases para retrabajo (solo accesible a rol
    // JEFE_PRODUCCION)
    @PostMapping
    @PreAuthorize("hasAnyRole('JEFE_PRODUCCION')")
    public ResponseEntity<List<OtFaseResponseDTO>> rehacerFases(@Valid @RequestBody RehacerFasesRequestDTO request,
            Authentication authentication) {
        List<OtFaseResponseDTO> response = otFaseService.rehacerFases(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
