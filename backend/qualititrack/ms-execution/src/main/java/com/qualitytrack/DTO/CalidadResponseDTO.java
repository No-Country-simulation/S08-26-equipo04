package com.qualitytrack.DTO;



import java.time.OffsetDateTime;


public class CalidadResponseDTO {
    private Long auditoriaId;
    private Long ordenTrabajoId;
    private String resultado;
    private String observacionesGenerales;
    private OffsetDateTime fechaVeredicto;
    private Integer cantidadRespuestas;

    public CalidadResponseDTO(Long auditoriaId, Long ordenTrabajoId, String resultado, String observacionesGenerales, OffsetDateTime fechaVeredicto, Integer cantidadRespuestas) {
        this.auditoriaId = auditoriaId;
        this.ordenTrabajoId = ordenTrabajoId;
        this.resultado = resultado;
        this.observacionesGenerales = observacionesGenerales;
        this.fechaVeredicto = fechaVeredicto;
        this.cantidadRespuestas = cantidadRespuestas;
    }
}