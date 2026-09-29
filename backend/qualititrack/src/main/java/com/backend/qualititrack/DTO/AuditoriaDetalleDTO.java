package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;
import java.util.List;

import com.backend.qualititrack.Enum.ResultadoCalidad;
import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaDetalleDTO {
    private Integer numeroAuditoria;
    private ResultadoCalidad resultado;
    private String observacionesGenerales;
    private OffsetDateTime fechaVeredicto;
    private String auditorNombre;
    private List<Item> respuestas;

    @Data
    @AllArgsConstructor
    public static class Item {
        private Integer itemNumero;
        private String criterioNombre;
        private AuditoriaChecklistRespuesta.ResultadoItem resultadoItem;
        private String observaciones;
    }
}