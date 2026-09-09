package com.backend.qualititrack.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fase")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la fase no puede estar vacío")
    @Column(nullable = false, unique = true)
    private String nombre;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Column(columnDefinition = "TEXT")
    private String descripcion;


    @NotNull(message = "El tiempo estándar no puede ser nulo")
    @Column(name = "tiempo_estandar_minutos", nullable = false)
    @Min(value = 1, message = "El tiempo debe ser al menos 1 minuto")
    private Integer tiempoEstandarMinutos;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    @OneToMany(
            mappedBy = "fase",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OT_Fase> otFases;
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }

}


