package com.backend.qualititrack.modelos;

import com.backend.qualititrack.Enum.EstadoSolicitud;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.time.LocalDateTime;

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
}
