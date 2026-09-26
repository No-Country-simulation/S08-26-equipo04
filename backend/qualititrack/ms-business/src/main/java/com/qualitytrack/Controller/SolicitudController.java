package com.qualitytrack.Controller;

import com.qualitytrack.DTO.SolicitudDTO;
//import com.qualitytrack.Service.CustomUserDetailService;
import com.qualitytrack.Service.SolicitudService;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    @Autowired
    private SolicitudService solicitudService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR')")
    public ResponseEntity<SolicitudDTO> crear(@RequestBody SolicitudDTO dto, Authentication auth) {

        //  vendedorId viene del JWT (del usuario autenticado)
        Long vendedorId = obtenerIdDelUsuario(auth);

        //  clienteId viene en el DTO (del request body)
        SolicitudDTO creado = solicitudService.crear(dto, vendedorId);

        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    private Long obtenerIdDelUsuario(Authentication auth) {
        String email = auth.getName(); // El "username" es el email
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return usuario.getId();
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
    public ResponseEntity<List<SolicitudDTO>> obtenerLista(@RequestParam(required = false) String param) {
        return ResponseEntity.ok().body(solicitudService.listarTodas());
    }
}
