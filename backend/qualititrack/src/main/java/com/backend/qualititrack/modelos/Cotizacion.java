package com.backend.qualititrack.modelos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoCotizacion;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cotizaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cotizacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_cotizacion", nullable = false, unique = true, length = 30)
    private String numeroCotizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private Solicitud solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jefe_produccion_id", nullable = false)
    private Usuario jefeProduccion;

    @Column(name = "precio_final", nullable = false, precision = 14, scale = 2)
    private BigDecimal precioFinal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCotizacion estado;

    @Column(name = "fecha_envio_cliente")
    private OffsetDateTime fechaEnvioCliente;

    @Column(name = "fecha_respuesta_cliente")
    private OffsetDateTime fechaRespuestaCliente;

    @Column(name = "motivo_rechazo_cliente", columnDefinition = "TEXT")
    private String motivoRechazoCliente;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at")
    private OffsetDateTime fechaActualizacion;

    @OneToMany(
        mappedBy = "cotizacion", 
        cascade = jakarta.persistence.CascadeType.ALL, 
        orphanRemoval = true
    )
    private java.util.List<CotizacionFase> fases = new java.util.ArrayList<>();


    @OneToOne(mappedBy = "cotizacion")
    @JsonIgnore
    private OrdenTrabajo ordenTrabajo;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = OffsetDateTime.now();
        fechaActualizacion = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = OffsetDateTime.now();
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroCotizacion() {
        return numeroCotizacion;
    }

    public void setNumeroCotizacion(String numeroCotizacion) {
        this.numeroCotizacion = numeroCotizacion;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Usuario getJefeProduccion() {
        return jefeProduccion;
    }

    public void setJefeProduccion(Usuario jefeProduccion) {
        this.jefeProduccion = jefeProduccion;
    }

    public BigDecimal getPrecioFinal() {
        return precioFinal;
    }

    public void setPrecioFinal(BigDecimal precioFinal) {
        this.precioFinal = precioFinal;
    }

    public EstadoCotizacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoCotizacion estado) {
        this.estado = estado;
    }

    public OffsetDateTime getFechaEnvioCliente() {
        return fechaEnvioCliente;
    }

    public void setFechaEnvioCliente(OffsetDateTime fechaEnvioCliente) {
        this.fechaEnvioCliente = fechaEnvioCliente;
    }

    public OffsetDateTime getFechaRespuestaCliente() {
        return fechaRespuestaCliente;
    }

    public void setFechaRespuestaCliente(OffsetDateTime fechaRespuestaCliente) {
        this.fechaRespuestaCliente = fechaRespuestaCliente;
    }

    public String getMotivoRechazoCliente() {
        return motivoRechazoCliente;
    }

    public void setMotivoRechazoCliente(String motivoRechazo) {
        this.motivoRechazoCliente = motivoRechazo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public OffsetDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(OffsetDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public OrdenTrabajo getOrdenTrabajo() {
        return ordenTrabajo;
    }

    public void setOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        this.ordenTrabajo = ordenTrabajo;
    }
}



