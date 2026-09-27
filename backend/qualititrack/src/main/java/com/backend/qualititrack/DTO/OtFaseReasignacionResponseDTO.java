package com.backend.qualititrack.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtFaseReasignacionResponseDTO {
    private Long id;
    private Long operarioId;
}
