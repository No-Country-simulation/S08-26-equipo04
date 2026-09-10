package com.backend.qualititrack.DTO;

import java.time.LocalDateTime;

import com.backend.qualititrack.Enum.EstadoSolicitud;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudDTO {
    private Long id;

    @NotNull(message = "El ID del cliente no puede ser nulo")
    private Long clienteId;

    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    private LocalDateTime fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    private String descripcionPieza;

    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    private int cantidad;

    private String notasComerciales;

    private EstadoSolicitud estado;
}
