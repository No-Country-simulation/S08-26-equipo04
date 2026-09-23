package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaseOperarioHabilitadoResponseDTO {

    private Long id;
    private Long faseCatalogoId;
    private Long operarioId;
    private Boolean habilitado;
    private Long asignadoPorId;
    private String nombreOperario;
    private OffsetDateTime createdAt;
}