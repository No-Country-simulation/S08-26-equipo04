package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoOT;

import jakarta.validation.constraints.Max;
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
// Revisar para que coincida con base (ver entidad en "modelos")
public class OrdenTrabajoDTO {
    private Long id;

    @NotNull(message = "El ID de cotización no puede ser nulo")
    private Long cotizacionId;

    private String numeroOT;

    @NotNull(message = "El estado no puede ser nulo")
    private EstadoOT estado;

    @NotBlank(message = "La descripción no puede estar vacía")
    private String descripcion;

    @NotNull(message = "La fecha de vencimiento no puede ser nula")
    private OffsetDateTime fechaVencimiento;

    @NotNull(message = "La prioridad no puede ser nula")
    @Min(value = 1, message = "Prioridad mínima: 1")
    @Max(value = 5, message = "Prioridad máxima: 5")
    private Integer prioridad;

    private String observaciones;

    private OffsetDateTime fechaCreacion;

    private OffsetDateTime fechaActualizacion;

    private OffsetDateTime fechaInicioProduccion;

    private OffsetDateTime fechaTerminoReal;

    private String receptorNombre;
    private OffsetDateTime fechaPaseCalidad;
    private OffsetDateTime fechaPaseDespacho;
}
