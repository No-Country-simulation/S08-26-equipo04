package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoOtFase;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// DTO para la lectura de OtFase,
public class OtFaseResponseDTO {
    private Long id;

    private Long ordenTrabajoId;
    
    private String numeroOt;

    private Long faseCatalogoId;
    
    private String faseNombre;

    private Integer numeroSecuencia;

    private Long operarioId;

    private Integer tiempoEstimadoMinutos;

    private OffsetDateTime fechaVencimiento;

    private EstadoOtFase estado;

    private OffsetDateTime fechaInicioReal;

    private OffsetDateTime fechaFinReal;

    private Integer duracionRealMinutos;

    private Boolean esRehacer;

    private Integer cicloIteracion;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}
