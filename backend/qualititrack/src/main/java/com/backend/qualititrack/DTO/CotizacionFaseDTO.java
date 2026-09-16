package com.backend.qualititrack.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionFaseDTO {
    @NotNull(message = "El ID de la fase de catálogo es requerido")
    private Long faseCatalogoId;

    @NotNull(message = "El número de secuencia es requerido")
    private Integer numeroSecuencia;

    @NotNull(message = "El tiempo estimado es requerido")
    private Integer tiempoEstimadoMinutos;

    private String instruccionesFase;
}