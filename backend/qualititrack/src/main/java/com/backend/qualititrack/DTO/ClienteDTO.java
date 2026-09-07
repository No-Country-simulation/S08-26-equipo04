package com.backend.qualititrack.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank
    private String email;

    private String telefono;

    private String direccion;

    private Boolean activo;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaUltimaActualizacion;
}
