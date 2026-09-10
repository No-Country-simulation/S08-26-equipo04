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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// 10. OT Fases[cite: 1]
@Entity
@Table(name = "ot_fases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"orden_trabajo_id", "numero_secuencia", "ciclo_iteracion"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtFase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_catalogo_id", nullable = false)
    private FaseCatalogo faseCatalogo;

    @Column(name = "numero_secuencia", nullable = false)
    private Integer numeroSecuencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id", nullable = false)
    private Usuario operario;

    @Column(name = "tiempo_estimado_minutos", nullable = false)
    private Integer tiempoEstimadoMinutos;

    @Column(name = "fecha_vencimiento")
    private OffsetDateTime fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoFase estado = EstadoFase.EN_COLA;

    @Column(name = "fecha_inicio_real")
    private OffsetDateTime fechaInicioReal;

    @Column(name = "fecha_fin_real")
    private OffsetDateTime fechaFinReal;

    @Column(name = "duracion_real_minutos")
    private Integer duracionRealMinutos;

    @Column(name = "es_rehacer", nullable = false)
    @Builder.Default
    private Boolean esRehacer = false;

    @Column(name = "ciclo_iteracion", nullable = false)
    @Builder.Default
    private Integer cicloIteracion = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum EstadoFase {
        EN_COLA, EN_EJECUCION, TERMINADO
    }
}