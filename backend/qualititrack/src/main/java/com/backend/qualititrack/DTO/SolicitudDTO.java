package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.EstadoSolicitud;
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
public class SolicitudDTO {
    @NotNull(message = "El ID del cliente no puede ser nulo")
    private Long clienteId;

    private String clienteNombre;

    @NotBlank(message = "La descripción no puede estar vacía")
    private String descripcion;

    @NotNull(message = "El estado no puede ser nulo")
    private EstadoSolicitud estado;

    private String planoUrl;

    private LocalDateTime fechaVencimiento;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
}
