package com.backend.qualititrack.Controller;

import com.backend.qualititrack.modelos.Fase;
import com.backend.qualititrack.modelos.FaseCatalogo;
import com.backend.qualititrack.Service.FaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.Service.FaseService;
import com.backend.qualititrack.modelos.FaseCatalogo;

@RestController
@RequestMapping("/api/fases")
public class FaseController {

    private final FaseService faseService;

    public FaseController(FaseService faseService) {
        this.faseService = faseService;
    }

    /**
     * GET /api/fases
     * Obtiene la lista de fases (Accesible por GERENTE y JEFE_PRODUCCION).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'JEFE_PRODUCCION')")
    public ResponseEntity<List<FaseCatalogo>> listarFases() {
        List<FaseCatalogo> fases = faseService.listarFases();
        return ResponseEntity.ok(fases);
    }

    /**
     * POST /api/fases
     * Crea una nueva fase (Solo GERENTE).
     */
    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<FaseCatalogo> crearFase(@RequestBody @Valid FaseCatalogo fase) {
        FaseCatalogo nuevaFase = faseService.crearFase(fase);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaFase);
    }

    /**
     * PUT /api/fases/{id}
     * Actualiza los campos de una fase existente o permite borrado lógico (Solo
     * GERENTE).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<FaseCatalogo> actualizarFase(
            @PathVariable Long id,
            @RequestBody FaseCatalogo detallesFase) {

        FaseCatalogo faseActualizada = faseService.actualizarFase(id, detallesFase);
        return ResponseEntity.ok(faseActualizada);
    }

    /**
     * POST /api/fases/{id}/habilitar
     * Habilita o deshabilita operarios sobre una fase específica mediante JSON Body
     * (Solo GERENTE).
     */
    @PostMapping("/{id}/habilitar")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<FaseCatalogo> habilitarOperarioEnFase(
            @PathVariable Long id,
            @RequestBody HabilitarOperarioDTO dto) {

        FaseCatalogo faseModificada = faseService.gestionarHabilitacionOperario(id, dto.getOperarioId(), dto.isHabilitado());
        return ResponseEntity.ok(faseModificada);
    }

    /**
     * DTO interno para recibir el payload del endpoint de habilitación.
     */
    public static class HabilitarOperarioDTO {
        private Long operarioId;
        private boolean habilitado;

        public Long getOperarioId() {
            return operarioId;
        }

        public void setOperarioId(Long operarioId) {
            this.operarioId = operarioId;
        }

        public boolean isHabilitado() {
            return habilitado;
        }

        public void setHabilitado(boolean habilitado) {
            this.habilitado = habilitado;
        }
    }
}