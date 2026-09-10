package com.backend.qualititrack.modelos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Immutable
@Table(name = "v_ot_expediente")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA requiere un constructor vacío
@AllArgsConstructor
public class OtExpediente {

    // --- Datos de la Orden de Trabajo ---
    @Id
    @Column(name = "ot_id", updatable = false, insertable = false)
    private Long otId;

    @Column(name = "numero_ot", updatable = false, insertable = false)
    private String numeroOt;

    @Column(name = "ot_estado", updatable = false, insertable = false)
    private String otEstado;

    @Column(name = "ot_cantidad", updatable = false, insertable = false)
    private Integer otCantidad;

    @Column(name = "fecha_inicio_produccion", updatable = false, insertable = false)
    private OffsetDateTime fechaInicioProduccion;

    @Column(name = "fecha_pase_calidad", updatable = false, insertable = false)
    private OffsetDateTime fechaPaseCalidad;

    @Column(name = "fecha_pase_despacho", updatable = false, insertable = false)
    private OffsetDateTime fechaPaseDespacho;

    @Column(name = "fecha_entrega", updatable = false, insertable = false)
    private OffsetDateTime fechaEntrega;

    @Column(name = "receptor_nombre", updatable = false, insertable = false)
    private String receptorNombre;

    // --- Datos de la Cotización ---
    @Column(name = "cotizacion_id", updatable = false, insertable = false)
    private Long cotizacionId;

    @Column(name = "numero_cotizacion", updatable = false, insertable = false)
    private String numeroCotizacion;

    @Column(name = "precio_final", updatable = false, insertable = false)
    private BigDecimal precioFinal;

    @Column(name = "cotizacion_estado", updatable = false, insertable = false)
    private String cotizacionEstado;

    // --- Datos de la Solicitud ---
    @Column(name = "solicitud_id", updatable = false, insertable = false)
    private Long solicitudId;

    @Column(name = "numero_solicitud", updatable = false, insertable = false)
    private String numeroSolicitud;

    @Column(name = "descripcion_pieza", columnDefinition = "TEXT", updatable = false, insertable = false)
    private String descripcionPieza;

    @Column(name = "fecha_esperada_entrega", updatable = false, insertable = false)
    private LocalDate fechaEsperadaEntrega;

    // --- Datos del Cliente ---
    @Column(name = "cliente_id", updatable = false, insertable = false)
    private Long clienteId;

    @Column(name = "cliente_razon_social", updatable = false, insertable = false)
    private String clienteRazonSocial;

    @Column(name = "cliente_contacto_nombre", updatable = false, insertable = false)
    private String clienteContactoNombre;

    // --- Datos del Vendedor ---
    @Column(name = "vendedor_id", updatable = false, insertable = false)
    private Long vendedorId;

    @Column(name = "vendedor_nombre", updatable = false, insertable = false)
    private String vendedorNombre;

}