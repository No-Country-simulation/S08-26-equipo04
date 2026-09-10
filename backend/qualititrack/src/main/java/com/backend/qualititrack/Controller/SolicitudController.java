package com.backend.qualititrack.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.qualititrack.DTO.SolicitudDTO;
import com.backend.qualititrack.Service.SolicitudService;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {
    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }
    // Crear endpoint POST /api/solicitudes para crear una nueva solicitud.
    // El body del request de un cliente registrado debe contar con: {cliente_id,
    // descripcion_pieza, cantidad, fecha_esperada_entrega, notas_comerciales}.
    // El body del request con un cliente nuevo cuenta con los datos crudos del
    // cliente en lugar de con cliente_id. Así, entonces, debe contar con:
    // {razon_social, contacto_nombre, telefono, email, direccion,
    // descripcion_pieza, cantidad, fecha_esperada_entrega, notas_comerciales}.
    // En el caso de un cliente nuevo, el backend crea el cliente antes de crear la
    // solicitud.
    // La respuesta exitosa debe incluir en el cuerpo el siguiente formato: {"id"=x,
    // "numero_solicitud"=SOL-XXXX, "estado"=PENDIENTE_COTIZACION}, para que se
    // tenga referencia a la solicitud creada y su estado inicial.
    // Verificar que el endpoint de creación de solicitudes valide que todos los
    // campos obligatorios estén presentes y sean correctos, devolviendo un error en
    // caso contrario.
    // Verificar que solo usuarios del rol Vendedor puedan crear nuevas solicitudes,
    // devolver un error de autorización en caso contrario.

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<SolicitudDTO> crear(@RequestBody SolicitudDTO dto) {

        SolicitudDTO creado = solicitudService.crear(dto, 1l); // debería enviar id de jwt, consultar cómo hacer bien luego

        // HTTP 201 Created (recurso creado exitosamente)
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Crear endpoint GET /api/solicitudes para obtener la lista de solicitudes
    // pendientes.
    // Verificar que el endpoint de obtención de solicitudes solo sea accesible por
    // usuarios con rol Vendedor y Jefe de producción, devolviendo un error de
    // autorización en caso contrario. (Nota: plan de frontend no menciona acceso a
    // rol Vendedor, pero puede ser útil para que controle cuáles solicitudes siguen
    // a la espera de cotizar)
    @GetMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION')")
    public ResponseEntity<List<SolicitudDTO>> obtenerLista(@RequestParam String param) {
        return ResponseEntity.ok().body(solicitudService.obtenerLista());
    }

}
