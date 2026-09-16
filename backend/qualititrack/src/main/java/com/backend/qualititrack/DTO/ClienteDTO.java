package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String contactoNombre;

    @Email(message = "Email inválido")
    private String email;

    @NotBlank
    private String razonSocial;

    @NotBlank
    private String telefono;

    @NotBlank
    private String direccion;

    private Boolean activo;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}