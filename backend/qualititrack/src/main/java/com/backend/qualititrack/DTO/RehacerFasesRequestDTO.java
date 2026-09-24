package com.backend.qualititrack.DTO;

import java.util.List;
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
    private List<Long> fasesIds; // IDs de las fases de la iteración actual que se van a rehacer
}