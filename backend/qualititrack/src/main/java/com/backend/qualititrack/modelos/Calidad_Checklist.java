package com.backend.qualititrack.modelos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "calidad_checklist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Calidad_Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean conformidadDimensional = false;

    @Column(nullable = false)
    private Boolean fasesCompletas = false;

    @Column(nullable = false)
    private Boolean terminacionSuperficie = false;

    @Column(nullable = false)
    private Integer cantidadPieza = 0;

    @Column(nullable = false)
    private Boolean identificacion = false;

    @Column(nullable = false)
    private Boolean documentacion = false;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_verificacion", nullable = false)
    private LocalDateTime fechaVerificacion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_trabajo_id", nullable = false, unique = true)
    private OrdenTrabajo ordenTrabajo;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (fechaVerificacion == null) {
            fechaVerificacion = LocalDateTime.now();
        }
    }
}
