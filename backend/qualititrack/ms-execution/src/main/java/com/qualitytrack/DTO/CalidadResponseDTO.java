package com.qualitytrack.DTO;



import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class CalidadResponseDTO {
    private Long auditoriaId;
    private Long ordenTrabajoId;
    private String resultado;
    private String observacionesGenerales;
    private OffsetDateTime fechaVeredicto;
    private Integer cantidadRespuestas;
}