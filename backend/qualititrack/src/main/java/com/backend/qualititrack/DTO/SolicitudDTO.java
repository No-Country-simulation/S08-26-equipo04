package com.backend.qualititrack.DTO;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoSolicitud;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class SolicitudDTO {

    // Campos de identificacion y estado
    private Long id;
    private String numeroSolicitud;
    private EstadoSolicitud estado;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Obligatorio
    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    private String descripcionPieza;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    private Integer cantidad;

    // Opcional
    private LocalDate fechaEsperadaEntrega;
    private String notasComerciales;

    // Para cliente registrado
    private Long clienteId;

    // Para cliente nuevo (Datos crudos)
    private String razonSocial;
    private String contactoNombre;
    private String telefono;
    private String direccion;
    private String email;
}