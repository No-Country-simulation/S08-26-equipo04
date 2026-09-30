package com.qualitytrack.DTO;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtFaseReasignacionRequestDTO {
    @JsonAlias("operarioNuevoId")
    private Long operarioNuevoId;
    private String motivo;
}
