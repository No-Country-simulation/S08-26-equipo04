package com.backend.qualititrack.DTO;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
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
    private BigDecimal precioFinal;

    @NotNull(message = "Debe incluir al menos una fase")
    @NotEmpty(message = "La cotización debe incluir al menos una fase")
    @Valid
    private List<CotizacionFaseDTO> fases;

    private String estado;
    private String observaciones;
    private OffsetDateTime fechaEnvioCliente;
    private OffsetDateTime fechaRespuestaCliente;
    private String motivoRechazoCliente;
    private OffsetDateTime fechaCreacion;
}