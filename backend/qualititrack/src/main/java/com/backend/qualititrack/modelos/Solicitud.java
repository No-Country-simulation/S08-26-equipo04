package com.backend.qualititrack.modelos;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoSolicitud;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "solicitudes")
@Getter 
@Setter 
@NoArgsConstructor @AllArgsConstructor
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_solicitud", nullable = false, unique = true, length = 30)
    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    @Column(name = "fecha_esperada_entrega")
    private LocalDate fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    @Column(name = "descripcion_pieza", nullable = false, columnDefinition = "TEXT")
    private String descripcionPieza;

    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    @Column(nullable = false)
    private Integer cantidad = 1;

    @Column(name = "notas_comerciales", columnDefinition = "TEXT")
    private String notasComerciales;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE_COTIZACION;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @PrePersist
    protected void onCreate() {
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE_COTIZACION;
        }
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

}