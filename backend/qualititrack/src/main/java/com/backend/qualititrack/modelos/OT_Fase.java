package com.backend.qualititrack.modelos;

import com.backend.qualititrack.Enum.EstadoOtFase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ot_fase")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OT_Fase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El tiempo estimado no puede ser nulo")
    @Column(name = "tiempo_estimado_minutos", nullable = false)
    @Min(value = 1)
    private Integer tiempoEstimadoMinutos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOtFase estado;

    @NotNull(message = "El orden de secuencia no puede ser nulo")
    @Column(name = "orden_secuencia", nullable = false)
    @Min(value = 1)
    private Integer ordenSecuencia;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_termino")
    private LocalDateTime fechaTermino;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fase_id", nullable = false)
    private Fase fase;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operario_id", nullable = false)
    private Usuario operario;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoOtFase.PENDIENTE;
        }
    }
}
