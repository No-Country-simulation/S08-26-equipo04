package com.backend.qualititrack.Controller;

import com.backend.qualititrack.DTO.ClienteDTO;
import com.backend.qualititrack.Service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    /**
     * POST /api/clientes
     * ✅ Solo VENDEDOR y JEFE_PRODUCCION pueden crear clientes
     * Requiere token JWT válido
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'GERENTE')")
    public ResponseEntity<?> crear(@Valid @RequestBody ClienteDTO clienteDTO) {
        try {
            ClienteDTO creado = clienteService.crear(clienteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/clientes
     * ✅ Solo VENDEDOR y JEFE_PRODUCCION pueden listar todos los clientes
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'GERENTE')")
    public ResponseEntity<List<ClienteDTO>> listarTodos() {
        try {
            List<ClienteDTO> clientes = clienteService.listarTodos();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/clientes/{id}
     * ✅ Solo VENDEDOR y JEFE_PRODUCCION pueden ver detalles de un cliente
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'GERENTE')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            ClienteDTO cliente = clienteService.obtenerPorId(id);
            return ResponseEntity.ok(cliente);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }


    /**
     * GET /api/clientes/email/{email}
     * ✅ Solo VENDEDOR y JEFE_PRODUCCION pueden buscar por email
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'GERENTE')")
    public ResponseEntity<?> obtenerPorEmail(@PathVariable String email) {
        try {
            ClienteDTO cliente = clienteService.obtenerPorEmail(email);
            return ResponseEntity.ok(cliente);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * PUT /api/clientes/{id}
     * ✅ Solo VENDEDOR y JEFE_PRODUCCION pueden actualizar clientes
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'JEFE_PRODUCCION', 'GERENTE')")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody ClienteDTO clienteDTO) {
        try {
            ClienteDTO actualizado = clienteService.actualizar(id, clienteDTO);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * DELETE /api/clientes/{id}
     * ✅ Solo GERENTE puede eliminar clientes
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            clienteService.eliminar(id);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("message", "Cliente eliminado exitosamente");
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
