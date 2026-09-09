package com.backend.qualititrack.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cotizacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cotizacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El precio no puede ser nulo")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioTotal;

    //@Enumerated(EnumType.STRING)
    //@Column(nullable = false, length = 50)
    //private EstadoCotizacion estado;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_aceptacion")
    private LocalDateTime fechaAceptacion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private Solicitud solicitud;

    @OneToMany(
            mappedBy = "cotizacion",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OrdenTrabajo> ordenesTrabajos;
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }

}



