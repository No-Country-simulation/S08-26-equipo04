package com.backend.qualititrack.modelos;

import com.backend.qualititrack.Enum.EstadoSolicitud;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
/*
@Entity
@Table(name = "solicitud")
@Data
@NoArgsConstructor @AllArgsConstructor
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La URL del plano no puede estar vacio")
    @Column(name = "plano_url", nullable = false)
    private String planoUrl;

    @NotNull(message = "La fecha no peude ser nula")
    @Column(name = "fecha_esperada_entrega", nullable = false)
    private LocalDateTime fechaEsperadaEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @OneToOne(
            mappedBy = "solicitud",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Cotizacion cotizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoSolicitud.CREADA;
        }
    }
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }


    /* // Vendedor acaba de cargarla // Jefe de Producción la elaboró y envió // Cliente aprobó → se genera OT // Cliente rechazó → FIN */
//}
@Entity
@Table(name = "solicitud")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_solicitud", nullable = false, unique = true)
    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    @Column(name = "fecha_esperada_entrega", nullable = false)
    private LocalDateTime fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    @Column(name = "descripcion_pieza", nullable = false)
    private String descripcionPieza;

    @Column(name = "plano_url", nullable = true)
    private String planoUrl;

    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    @Column(nullable = false)
    private int cantidad = 1;

    @Column
    private String notasComerciales;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @OneToOne(
            mappedBy = "solicitud",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Cotizacion cotizacion;

    @PrePersist
    protected void onCreate() {
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE_COTIZACION;
        }
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getNumeroSolicitud() {
        return numeroSolicitud;
    }

    public String getDescripcionPieza() {
        return descripcionPieza;
    }

    public LocalDateTime getFechaEsperadaEntrega() {
        return fechaEsperadaEntrega;
    }

    public int getCantidad() {
        return cantidad;
    }

    public String getNotasComerciales() {
        return notasComerciales;
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public Usuario getVendedor() {
        return vendedor;
    }

    public Cotizacion getCotizacion() {
        return cotizacion;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNumeroSolicitud(String numeroSolicitud) {
        this.numeroSolicitud = numeroSolicitud;
    }

    public void setFechaEsperadaEntrega(LocalDateTime fechaEsperadaEntrega) {
        this.fechaEsperadaEntrega = fechaEsperadaEntrega;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public void setDescripcionPieza(String descripcionPieza) {
        this.descripcionPieza = descripcionPieza;
    }

    public void setNotasComerciales(String notasComerciales) {
        this.notasComerciales = notasComerciales;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    public void setCotizacion(Cotizacion cotizacion) {
        this.cotizacion = cotizacion;
    }
}