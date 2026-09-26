package com.qualitytrack.modelos;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auditoria_checklist_respuestas", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"auditoria_id", "item_numero"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaChecklistRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditoria_id", nullable = false)
    private AuditoriaCalidad auditoria;

    @Column(name = "item_numero", nullable = false)
    private Integer itemNumero;

    @Column(name = "criterio_nombre", nullable = false, length = 120)
    private String criterioNombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_item", length = 20)
    private ResultadoItem resultadoItem;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    public enum ResultadoItem {
        CUMPLE, NO_CUMPLE, NO_APLICA
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AuditoriaCalidad getAuditoria() {
        return auditoria;
    }

    public void setAuditoria(AuditoriaCalidad auditoria) {
        this.auditoria = auditoria;
    }

    public Integer getItemNumero() {
        return itemNumero;
    }

    public void setItemNumero(Integer itemNumero) {
        this.itemNumero = itemNumero;
    }

    public String getCriterioNombre() {
        return criterioNombre;
    }

    public void setCriterioNombre(String criterioNombre) {
        this.criterioNombre = criterioNombre;
    }

    public ResultadoItem getResultadoItem() {
        return resultadoItem;
    }

    public void setResultadoItem(ResultadoItem resultadoItem) {
        this.resultadoItem = resultadoItem;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}