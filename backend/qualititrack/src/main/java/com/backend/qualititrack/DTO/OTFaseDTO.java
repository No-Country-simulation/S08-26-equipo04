package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.EstadoOtFase;
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
public class OTFaseDTO {
    private Long id;

    @NotNull(message = "El ID de OT no puede ser nulo")
    private Long ordenTrabajoId;

    private String numeroOT;

    @NotNull(message = "El ID de fase no puede ser nulo")
    private Long faseId;

    private String nombreFase;

    private Integer tiempoEstandarMinutos;

    private Long operarioId;

    private String nombreOperario;

    @NotNull(message = "El estado no puede ser nulo")
    private EstadoOtFase estado;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaTermino;

    private String observaciones;

    private LocalDateTime fechaCreacion;
}
