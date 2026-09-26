package com.qualitytrack.modelos;

import java.time.OffsetDateTime;

import com.qualitytrack.Enum.EstadoOtFase;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// OT Fases
@Entity
@Table(name = "ot_fases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"orden_trabajo_id", "numero_secuencia", "ciclo_iteracion"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtFase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_catalogo_id", nullable = false)
    private FaseCatalogo faseCatalogo;

    @Column(name = "numero_secuencia", nullable = false)
    private Integer numeroSecuencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id", nullable = false)
    private Usuario operario;

    @Column(name = "tiempo_estimado_minutos", nullable = false)
    private Integer tiempoEstimadoMinutos;

    @Column(name = "fecha_vencimiento")
    private OffsetDateTime fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoOtFase estado = EstadoOtFase.EN_COLA;

    @Column(name = "fecha_inicio_real")
    private OffsetDateTime fechaInicioReal;

    @Column(name = "fecha_fin_real")
    private OffsetDateTime fechaFinReal;

    @Column(name = "duracion_real_minutos")
    private Integer duracionRealMinutos;

    @Column(name = "es_rehacer", nullable = false)
    @Builder.Default
    private Boolean esRehacer = false;

    @Column(name = "ciclo_iteracion", nullable = false)
    @Builder.Default
    private Integer cicloIteracion = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OrdenTrabajo getOrdenTrabajo() {
        return ordenTrabajo;
    }

    public void setOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        this.ordenTrabajo = ordenTrabajo;
    }

    public Integer getNumeroSecuencia() {
        return numeroSecuencia;
    }

    public void setNumeroSecuencia(Integer numeroSecuencia) {
        this.numeroSecuencia = numeroSecuencia;
    }

    public FaseCatalogo getFaseCatalogo() {
        return faseCatalogo;
    }

    public void setFaseCatalogo(FaseCatalogo faseCatalogo) {
        this.faseCatalogo = faseCatalogo;
    }

    public Usuario getOperario() {
        return operario;
    }

    public void setOperario(Usuario operario) {
        this.operario = operario;
    }

    public OffsetDateTime getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(OffsetDateTime fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public Integer getTiempoEstimadoMinutos() {
        return tiempoEstimadoMinutos;
    }

    public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) {
        this.tiempoEstimadoMinutos = tiempoEstimadoMinutos;
    }

    public EstadoOtFase getEstado() {
        return estado;
    }

    public void setEstado(EstadoOtFase estado) {
        this.estado = estado;
    }

    public OffsetDateTime getFechaFinReal() {
        return fechaFinReal;
    }

    public void setFechaFinReal(OffsetDateTime fechaFinReal) {
        this.fechaFinReal = fechaFinReal;
    }

    public OffsetDateTime getFechaInicioReal() {
        return fechaInicioReal;
    }

    public void setFechaInicioReal(OffsetDateTime fechaInicioReal) {
        this.fechaInicioReal = fechaInicioReal;
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