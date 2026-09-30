package com.qualitytrack.DTO;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RehacerFasesRequestDTO {

    @NotNull(message = "El ID de la orden de trabajo es obligatorio")
    private Long ordenTrabajoId;

    @NotEmpty(message = "Debe seleccionar al menos una fase para rehacer")
    @Valid
    private List<FaseRehacerDTO> fases;

    @Getter
    @Setter
    public static class FaseRehacerDTO {
        @NotNull private Long faseId;                    // fase TERMINADA que se rehace
        @NotNull private Long operarioId;                // elegido por el Jefe
        @NotNull @Min(1) private Integer tiempoEstimadoMinutos;
    }
}