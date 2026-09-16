package com.backend.qualititrack.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
public class CotizacionDTO {
    private Long id;
    private String numeroCotizacion;

    @NotNull(message = "Solicitud requerida")
    private Long solicitudId;

    private Long jefeProduccionId; // se saca del token, notnull no es necesario

    @NotNull(message = "Precio requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a cero")
    private BigDecimal precioTotal;

    @NotNull(message = "Debe incluir al menos una fase")
    private List<CotizacionFaseDTO> fases;

    private String estado;
    private String observaciones;
    private LocalDateTime fechaEnvioCliente;
    private LocalDateTime fechaRespuestaCliente;
    private String motivoRechazo;
    private LocalDateTime fechaCreacion;
}