package com.backend.qualititrack.modelos;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 9. Órdenes de Trabajo[cite: 1]
@Entity
@Table(name = "ordenes_trabajo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_ot", nullable = false, unique = true, length = 30)
    private String numeroOt;

    // Relación uno a uno por regla D8 / R5 del negocio (Unique)[cite: 1]
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cotizacion_id", nullable = false, unique = true)
    private Cotizacion cotizacion;

    @Column(nullable = false)
    @Builder.Default
    private Integer cantidad = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoOT estado = EstadoOT.EN_PRODUCCION;

    @Column(name = "fecha_inicio_produccion")
    private OffsetDateTime fechaInicioProduccion;

    @Column(name = "fecha_pase_calidad")
    private OffsetDateTime fechaPaseCalidad;

    @Column(name = "fecha_pase_despacho")
    private OffsetDateTime fechaPaseDespacho;

    @Column(name = "fecha_entrega")
    private OffsetDateTime fechaEntrega;

    @Column(name = "receptor_nombre", length = 150)
    private String receptorNombre;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum EstadoOT {
        EN_PRODUCCION, EN_CALIDAD, NO_CONFORME, DESPACHO, ENTREGADA
    }
}