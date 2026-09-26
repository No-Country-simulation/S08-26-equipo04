package com.qualitytrack.Controller;

import com.qualitytrack.DTO.CalidadConformidadDTO;
import com.qualitytrack.DTO.CalidadResponseDTO;
import com.qualitytrack.Service.CalidadService;
import com.qualitytrack.modelos.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/calidad")
    public class CalidadController {

        @Autowired
        private CalidadService calidadService;

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
           /* Usuario auditor = new Usuario();
            auditor.setEmail(authentication.getName());

            CalidadResponseDTO response = calidadService.marcarConforme(id, dto, String.valueOf(auditor));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);*/
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

            /*Usuario auditor = new Usuario();
            auditor.setEmail(authentication.getName());

            CalidadResponseDTO response = calidadService.marcarNoConforme(id, dto, String.valueOf(auditor));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);*/
            String emailAuditor = authentication.getName(); // Extrae email del JWT
            CalidadResponseDTO respuesta = calidadService.marcarNoConforme(id, dto, emailAuditor);

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
    }

