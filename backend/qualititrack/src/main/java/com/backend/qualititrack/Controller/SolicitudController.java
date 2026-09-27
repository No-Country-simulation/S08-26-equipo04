package com.backend.qualititrack.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.SolicitudDTO;
import com.backend.qualititrack.DTO.SolicitudResponseDTO;
import com.backend.qualititrack.Service.SolicitudService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {
    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    // POST /api/solicitudes
    // Crear una nueva solicitud (y cliente si también es nuevo).
    // Body (cliente registrado):
    // {cliente_id, descripcion_pieza, cantidad, fecha_esperada_entrega,
    // notas_comerciales}
    // Body (cliente nuevo):
    // {razon_social, contacto_nombre, telefono, email, direccion,
    // descripcion_pieza, cantidad, fecha_esperada_entrega, notas_comerciales}.
    // Respuesta exitosa: {"id"=x, "numero_solicitud"=SOL-XXXX,
    // "estado"=PENDIENTE_COTIZACION}
    // Permisos: Vendedor
    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<SolicitudResponseDTO> crear(@RequestBody @Valid SolicitudDTO dto,
            Authentication authentication) {

        // Obtener mail del usuario actual para luego identificar su id en el servicio
        String emailVendedor = authentication.getName();
        SolicitudResponseDTO creada = solicitudService.crear(dto, emailVendedor);

        // HTTP 201 Created (recurso creado exitosamente)
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // GET /api/solicitudes
    // Jefe de producción -> solo PENDIENTE_COTIZACION | Vendedor -> todas.
    @GetMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION')")
    public ResponseEntity<List<SolicitudDTO>> obtenerLista(Authentication authentication) {
        // Verificar si es jefe o no para ver qué método llamar.
        boolean esJefe = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_JEFE_PRODUCCION"));
        List<SolicitudDTO> lista = esJefe
                ? solicitudService.obtenerPendientes()
                : solicitudService.obtenerTodas();
        return ResponseEntity.ok().body(lista);
    }

}