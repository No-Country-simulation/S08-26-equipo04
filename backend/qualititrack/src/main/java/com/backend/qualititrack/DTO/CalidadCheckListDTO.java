package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.ResultadoCalidad;
import jakarta.validation.constraints.Min;
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
public class CalidadCheckListDTO {
    private Long id;

    @NotNull(message = "El ID de OT no puede ser nulo")
    private Long ordenTrabajoId;

    private String numeroOT;

    // Los 7 puntos de verificación
    @NotNull
    private Boolean conformidadDimensional;

    @NotNull
    private Boolean fasesCompletas;

    @NotNull
    private Boolean terminacionSuperficie;

    @NotNull
    @Min(value = 0, message = "La cantidad debe ser >= 0")
    private Integer cantidadPieza;

    @NotNull
    private Boolean identificacion;

    @NotNull
    private Boolean pruebaFuncional;

    @NotNull
    private Boolean documentacion;

    // Resultado
    @NotNull(message = "El resultado no puede ser nulo")
    private ResultadoCalidad resultado;

    private String observaciones;

    private LocalDateTime fechaVerificacion;

    private LocalDateTime fechaCreacion;
}
