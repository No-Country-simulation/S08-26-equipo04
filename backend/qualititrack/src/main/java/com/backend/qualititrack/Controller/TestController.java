package com.backend.qualititrack.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/inicio")
public class TestController {

    @GetMapping("/publico")
    @PreAuthorize("permitAll()")
    public String publico() {
        return "Este endpoint es público";
    }

    @GetMapping("/privado")
    @PreAuthorize("hasAnyRole('GERENTE')")
    public String privado() {
        return "¡Acceso concedido! Has autenticado exitosamente tu JWT y tienes los permisos requeridos.";
    }
}
