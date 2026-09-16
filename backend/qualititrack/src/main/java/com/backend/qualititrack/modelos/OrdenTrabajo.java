package com.backend.qualititrack.modelos;

import java.time.OffsetDateTime;
import java.util.List;

import com.backend.qualititrack.Enum.EstadoOT;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ordenes_trabajo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenTrabajo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El número de OT no puede estar vacío")
    @Column(name = "numero_ot", nullable = false, unique = true)
    private String numeroOt;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 30)
    private EstadoOT estado;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "fecha_inicio_produccion")
    private OffsetDateTime fechaInicioProduccion;

    @Column(name = "fecha_entrega")
    private OffsetDateTime fechaEntrega;

    @Column(name = "fecha_pase_calidad")
    private OffsetDateTime fechaPaseCalidad;

    @Column(name = "fecha_pase_despacho")
    private OffsetDateTime fechaPaseDespacho;

    @Column(name = "receptor_nombre", length = 150)
    private String receptorNombre;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cotizacion_id", nullable = false)
    private Cotizacion cotizacion;

    @OneToMany(
            mappedBy = "ordenTrabajo",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OtFase> fases;

    @OneToOne(
            mappedBy = "ordenTrabajo",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private AuditoriaCalidad calidadChecklist;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (estado == null) {
            estado = EstadoOT.EN_PRODUCCION;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroOt() {
        return numeroOt;
    }

    public void setNumeroOt(String numeroOt) {
        this.numeroOt = numeroOt;
    }

    public EstadoOT getEstado() {
        return estado;
    }

    public void setEstado(EstadoOT estado) {
        this.estado = estado;
    }

    public OffsetDateTime getFechaInicioProduccion() {
        return fechaInicioProduccion;
    }

    public void setFechaInicioProduccion(OffsetDateTime fechaInicio) {
        this.fechaInicioProduccion = fechaInicio;
    }

    public OffsetDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(OffsetDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime fechaCreacion) {
        this.createdAt = fechaCreacion;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime fechaActualizacion) {
        this.updatedAt = fechaActualizacion;
    }

    public Cotizacion getCotizacion() {
        return cotizacion;
    }

    public void setCotizacion(Cotizacion cotizacion) {
        this.cotizacion = cotizacion;
    }

    public List<OtFase> getFases() {
        return fases;
    }

    public void setFases(List<OtFase> fases) {
        this.fases = fases;
    }

    public AuditoriaCalidad getCalidadChecklist() {
        return calidadChecklist;
    }

    public void setCalidadChecklist(AuditoriaCalidad calidadChecklist) {
        this.calidadChecklist = calidadChecklist;
    }

}