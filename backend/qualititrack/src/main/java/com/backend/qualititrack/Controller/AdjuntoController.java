package com.backend.qualititrack.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.qualititrack.DTO.AdjuntoResponseDTO;
import com.backend.qualititrack.Service.AdjuntoService;
import com.backend.qualititrack.modelos.Adjunto;

@RestController
@RequestMapping("/api")
public class AdjuntoController {

    private final AdjuntoService adjuntoService;

    public AdjuntoController(AdjuntoService adjuntoService) {
        this.adjuntoService = adjuntoService;
    }

    @PostMapping(value = "/documentos", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<AdjuntoResponseDTO> subirDocumento(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("solicitudId") Long solicitudId,
            @RequestParam("tipoArchivo") Adjunto.TipoArchivo tipoArchivo,
            Authentication authentication) throws IOException {

        AdjuntoResponseDTO respuesta = adjuntoService.guardar(
                archivo,
                solicitudId,
                tipoArchivo,
                authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping("/solicitudes/{solicitudId}/documentos")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'OPERARIO')")
    public ResponseEntity<List<AdjuntoResponseDTO>> listarDocumentos(
            @PathVariable Long solicitudId) {

        return ResponseEntity.ok(
                adjuntoService.listarPorSolicitud(solicitudId));
    }
}