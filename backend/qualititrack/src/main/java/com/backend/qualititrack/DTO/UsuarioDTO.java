package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.NivelRol;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor 
@AllArgsConstructor 
@Data 
public class UsuarioDTO {
    // ==================== FIELDS ====================

    private Long id;

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email no puede estar vacío")
    private String email;

    @NotNull(message = "El rol no puede ser nulo")
    private NivelRol rol;

    private String tipoTarea;
    
    private String telefono;

    private Boolean activo;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}