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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 8. Cotización Fases[cite: 1]
@Entity
@Table(name = "cotizacion_fases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"cotizacion_id", "numero_secuencia"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionFase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cotizacion_id", nullable = false)
    private Cotizacion cotizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_catalogo_id", nullable = false)
    private FaseCatalogo faseCatalogo;

    @Column(name = "numero_secuencia", nullable = false)
    private Integer numeroSecuencia;

    @Column(name = "tiempo_estimado_minutos", nullable = false)
    private Integer tiempoEstimadoMinutos;

    @Column(name = "instrucciones_fase", columnDefinition = "TEXT")
    private String instruccionesFase;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}