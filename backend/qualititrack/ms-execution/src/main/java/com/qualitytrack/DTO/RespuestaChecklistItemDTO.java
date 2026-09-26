package com.qualitytrack.DTO;

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
    private String resultadoItem; // CUMPLE, NO_CUMPLE, NO_APLICA

    private String observaciones;

    public Integer getItemNumero() {
        return itemNumero;
    }

    public String getResultadoItem() {
        return resultadoItem;
    }

    public String getObservaciones() {
        return observaciones;
    }
}
