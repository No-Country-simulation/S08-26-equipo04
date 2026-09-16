package com.backend.qualititrack.modelos;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 13. Auditorías Calidad[cite: 1]
@Entity
@Table(name = "auditorias_calidad", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"orden_trabajo_id", "numero_auditoria"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaCalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = false)
    private Usuario auditor;

    @Column(name = "numero_auditoria", nullable = false)
    @Builder.Default
    private Integer numeroAuditoria = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Resultado resultado;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "fecha_veredicto", nullable = false)
    private OffsetDateTime fechaVeredicto;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // En la clase AuditoriaCalidad:
    @OneToMany(mappedBy = "auditoria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditoriaChecklistRespuesta> respuestas = new ArrayList<>();

    public enum Resultado {
        CONFORME, NO_CONFORME
    }
}