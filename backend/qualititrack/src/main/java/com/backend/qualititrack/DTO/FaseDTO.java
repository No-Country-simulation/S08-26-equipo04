package com.backend.qualititrack.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaseDTO {
    private Long id;

    @NotBlank(message = "El nombre de la fase no puede estar vacío")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El tiempo estándar no puede ser nulo")
    @Min(value = 1, message = "El tiempo debe ser al menos 1 minuto")
    private Integer tiempoEstandarMinutos;

    private Boolean activa;

    private LocalDateTime fechaCreacion;
}
