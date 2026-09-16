package com.backend.qualititrack.modelos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 7. Cotizaciones[cite: 1]
@Entity
@Table(name = "cotizaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_cotizacion", nullable = false, unique = true, length = 30)
    private String numeroCotizacion;

    // Relación uno a uno por regla D7 / R4 del negocio (Unique)[cite: 1]
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private Solicitud solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jefe_produccion_id", nullable = false)
    private Usuario jefeProduccion;

    @Column(name = "precio_final", nullable = false, precision = 14, scale = 2)
    private BigDecimal precioFinal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoCotizacion estado = EstadoCotizacion.LISTA_PARA_ENVIAR;

    @Column(name = "fecha_envio_cliente")
    private OffsetDateTime fechaEnvioCliente;

    @Column(name = "fecha_respuesta_cliente")
    private OffsetDateTime fechaRespuestaCliente;

    @Column(name = "motivo_rechazo_cliente", columnDefinition = "TEXT")
    private String motivoRechazoCliente;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CotizacionFase> fases;

    public enum EstadoCotizacion {
        LISTA_PARA_ENVIAR, ENVIADA_A_CLIENTE, APROBADA, NO_APROBADA
    }
}