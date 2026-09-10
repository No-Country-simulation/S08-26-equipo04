package com.backend.qualititrack.modelos;

import java.time.LocalDateTime;

import com.backend.qualititrack.Enum.EstadoSolicitud;

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
import jakarta.persistence.OneToOne;
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
@Table(name = "solicitud")
@Getter 
@Setter 
@NoArgsConstructor @AllArgsConstructor
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_solicitud", nullable = false, unique = true)
    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    @Column(name = "fecha_esperada_entrega", nullable = false)
    private LocalDateTime fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    @Column(name = "descripcion_pieza", nullable = false)
    private String descripcionPieza;

    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    @Column(nullable = false)
    private int cantidad = 1;

    @Column
    private String notasComerciales;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @OneToOne(
            mappedBy = "solicitud",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Cotizacion cotizacion;

    @PrePersist
    protected void onCreate() {
        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE_COTIZACION;
        }
    }

}
