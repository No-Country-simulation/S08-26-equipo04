package com.backend.qualititrack.DTO;

import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta.ResultadoItem;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaChecklistItemDTO {
    @NotNull(message = "El número de item es requerido")
    private Integer itemNumero;

    @NotNull(message = "El resultado del item es requerido")
    private ResultadoItem resultadoItem; // CUMPLE, NO_CUMPLE, NO_APLICA

    private String observaciones;

}
