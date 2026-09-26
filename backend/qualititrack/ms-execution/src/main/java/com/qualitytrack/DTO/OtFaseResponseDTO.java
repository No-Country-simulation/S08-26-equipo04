package com.qualitytrack.DTO;

import java.time.OffsetDateTime;

import com.qualitytrack.Enum.EstadoOtFase;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// DTO para la lectura de OtFase, 
public class OtFaseResponseDTO {
    private Long id;

    private Long ordenTrabajoId;

    private Long faseCatalogoId;

    private Integer numeroSecuencia;

    private Long operarioId;

    private Integer tiempoEstimadoMinutos;

    private OffsetDateTime fechaVencimiento;

    private EstadoOtFase estado;

    private OffsetDateTime fechaInicioReal;

    private OffsetDateTime fechaFinReal;

    private Integer duracionRealMinutos;

    private Boolean esRehacer;

    private Integer cicloIteracion;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;


    public EstadoOtFase getEstado() {
        return estado;
    }

    public void setEstado(EstadoOtFase estado) {
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrdenTrabajoId() {
        return ordenTrabajoId;
    }

    public void setOrdenTrabajoId(Long ordenTrabajoId) {
        this.ordenTrabajoId = ordenTrabajoId;
    }

    public Long getFaseCatalogoId() {
        return faseCatalogoId;
    }

    public void setFaseCatalogoId(Long faseCatalogoId) {
        this.faseCatalogoId = faseCatalogoId;
    }

    public Integer getNumeroSecuencia() {
        return numeroSecuencia;
    }

    public void setNumeroSecuencia(Integer numeroSecuencia) {
        this.numeroSecuencia = numeroSecuencia;
    }

    public Long getOperarioId() {
        return operarioId;
    }

    public void setOperarioId(Long operarioId) {
        this.operarioId = operarioId;
    }

    public Integer getTiempoEstimadoMinutos() {
        return tiempoEstimadoMinutos;
    }

    public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) {
        this.tiempoEstimadoMinutos = tiempoEstimadoMinutos;
    }

    public OffsetDateTime getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(OffsetDateTime fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public OffsetDateTime getFechaInicioReal() {
        return fechaInicioReal;
    }

    public void setFechaInicioReal(OffsetDateTime fechaInicioReal) {
        this.fechaInicioReal = fechaInicioReal;
    }

    public OffsetDateTime getFechaFinReal() {
        return fechaFinReal;
    }

    public void setFechaFinReal(OffsetDateTime fechaFinReal) {
        this.fechaFinReal = fechaFinReal;
    }

    public Integer getDuracionRealMinutos() {
        return duracionRealMinutos;
    }

    public void setDuracionRealMinutos(Integer duracionRealMinutos) {
        this.duracionRealMinutos = duracionRealMinutos;
    }

    public Boolean getEsRehacer() {
        return esRehacer;
    }

    public void setEsRehacer(Boolean esRehacer) {
        this.esRehacer = esRehacer;
    }

    public Integer getCicloIteracion() {
        return cicloIteracion;
    }

    public void setCicloIteracion(Integer cicloIteracion) {
        this.cicloIteracion = cicloIteracion;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
