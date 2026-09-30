package com.qualitytrack.DTO;

import java.time.OffsetDateTime;

import com.qualitytrack.Enum.EstadoOT;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenTrabajoResumenDTO {
    private Long id;
    private String numeroOt;
    private String cliente;
    private EstadoOT estado;
    private OffsetDateTime fecha;
}