package com.backend.qualititrack.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
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
public class CotizacionDTO {
    private Long id;

    @NotNull(message = "El ID de solicitud no puede ser nulo")
    private Long solicitudId;

    private String numeroSolicitud;

    @NotNull(message = "El precio total no puede ser nulo")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0.01")
    private BigDecimal precioTotal;

    @NotNull
    private BigDecimal margenGanancia;

    @NotNull
    private BigDecimal descuentoPorcentaje;

    private String observaciones;

    private LocalDateTime fechaVencimiento;

    private LocalDateTime fechaAceptacion;

    private LocalDateTime fechaCreacion;
}
