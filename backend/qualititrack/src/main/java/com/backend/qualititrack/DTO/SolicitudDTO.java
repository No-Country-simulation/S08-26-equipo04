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

    private Long id;

    // no es obligatorio, ya que cuando se crea hay que generarlo
    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    private LocalDate fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    private String descripcionPieza;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    private Integer cantidad;

    private String notasComerciales;

    private EstadoSolicitud estado;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // OPCIÓN A: Cliente ya registrado
    private Long clienteId;

    // OPCIÓN B: Cliente nuevo (Datos crudos)
    private String razonSocial;
    private String contactoNombre;
    private String telefono;
    private String direccion;
    private String email;

    @NotNull(message = "El vendedor es obligatorio")
    private Long vendedorId;
}