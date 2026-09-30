package com.qualitytrack.DTO;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import com.qualitytrack.Enum.EstadoOtFase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaseDetalleExpedienteDTO {
    private Long faseId;
    private String nombreFase;
    private Integer numeroSecuencia;
    private EstadoOtFase estadoFase;
    private OffsetDateTime fechaInicio;
    private OffsetDateTime fechaFin;
    private String operarioAsignado;

    // Trazabilidad de reasignaciones (quién la tuvo, cuándo y en qué ciclo de iteración / n° intento)
    private Integer numeroIntento;
    private String motivoReasignacion;
    private OffsetDateTime fechaReasignacion;
}