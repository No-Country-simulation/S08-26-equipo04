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

// 4. Fase Operarios Habilitados[cite: 1]
@Entity
@Table(name = "fase_operarios_habilitados", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"fase_catalogo_id", "operario_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaseOperarioHabilitado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_catalogo_id", nullable = false)
    private FaseCatalogo faseCatalogo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id", nullable = false)
    private Usuario operario;

    @Column(nullable = false)
    @Builder.Default
    private Boolean habilitado = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_por_id", nullable = false)
    private Usuario asignadoPor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}