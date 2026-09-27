package com.backend.qualititrack.DTO;

import java.time.LocalDateTime;
import com.backend.qualititrack.Enum.EstadoOtFase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaseDetalleExpedienteDTO {
    private Long faseId;
    private String nombreFase;
    private EstadoOtFase estadoFase;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String operarioAsignado;

    // Trazabilidad de reasignaciones (quién la tuvo, cuándo y en qué intento)
    private Integer numeroIntento;
    private String motivoReasignacion;
    private LocalDateTime fechaReasignacion;

    public Long getFaseId() {
        return faseId;
    }

    public void setFaseId(Long faseId) {
        this.faseId = faseId;
    }

    public String getNombreFase() {
        return nombreFase;
    }

    public void setNombreFase(String nombreFase) {
        this.nombreFase = nombreFase;
    }

    public EstadoOtFase getEstadoFase() {
        return estadoFase;
    }

    public void setEstadoFase(EstadoOtFase estadoFase) {
        this.estadoFase = estadoFase;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getOperarioAsignado() {
        return operarioAsignado;
    }

    public void setOperarioAsignado(String operarioAsignado) {
        this.operarioAsignado = operarioAsignado;
    }

    public Integer getNumeroIntento() {
        return numeroIntento;
    }

    public void setNumeroIntento(Integer numeroIntento) {
        this.numeroIntento = numeroIntento;
    }
}