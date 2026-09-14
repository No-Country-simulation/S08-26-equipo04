package com.backend.qualititrack.modelos;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 11. OT Fase Reasignaciones[cite: 1]
@Entity
@Table(name = "ot_fase_reasignaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtFaseReasignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ot_fase_id", nullable = false)
    private OtFase otFase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_anterior_id", nullable = false)
    private Usuario operarioAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_nuevo_id", nullable = false)
    private Usuario operarioNuevo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reasignado_por_id", nullable = false)
    private Usuario reasignadoPor;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "fecha_reasignacion", nullable = false, updatable = false)
    private OffsetDateTime fechaReasignacion;
}