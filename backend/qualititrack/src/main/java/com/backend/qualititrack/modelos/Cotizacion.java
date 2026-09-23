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
}



