package com.qualitytrack.modelos;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auditorias_calidad", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"orden_trabajo_id", "numero_auditoria"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaCalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = false)
    private Usuario auditor;

    @Column(name = "numero_auditoria", nullable = false)
    private Integer numeroAuditoria = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Resultado resultado;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "fecha_veredicto", nullable = false)
    private OffsetDateTime fechaVeredicto;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "auditoria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditoriaChecklistRespuesta> respuestas = new ArrayList<>();

    public enum Resultado {
        CONFORME, NO_CONFORME
    }

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

    public Usuario getAuditor() {
        return auditor;
    }

    public void setAuditor(Usuario auditor) {
        this.auditor = auditor;
    }

    public Integer getNumeroAuditoria() {
        return numeroAuditoria;
    }

    public void setNumeroAuditoria(Integer numeroAuditoria) {
        this.numeroAuditoria = numeroAuditoria;
    }

    public Resultado getResultado() {
        return resultado;
    }

    public void setResultado(Resultado resultado) {
        this.resultado = resultado;
    }

    public String getObservacionesGenerales() {
        return observacionesGenerales;
    }

    public void setObservacionesGenerales(String observacionesGenerales) {
        this.observacionesGenerales = observacionesGenerales;
    }

    public OffsetDateTime getFechaVeredicto() {
        return fechaVeredicto;
    }

    public void setFechaVeredicto(OffsetDateTime fechaVeredicto) {
        this.fechaVeredicto = fechaVeredicto;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<AuditoriaChecklistRespuesta> getRespuestas() {
        return respuestas;
    }

    public void setRespuestas(List<AuditoriaChecklistRespuesta> respuestas) {
        this.respuestas = respuestas;
    }
}