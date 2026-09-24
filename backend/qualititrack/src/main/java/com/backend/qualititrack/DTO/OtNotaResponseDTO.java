package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.modelos.OtNota.OrigenNota;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtNotaResponseDTO {
    private Long id;
    private Long ordenTrabajoId;
    private Long otFaseId;
    private Long usuarioId;
    private OrigenNota origen;
    private String contenido;
    private OffsetDateTime createdAt;
}
