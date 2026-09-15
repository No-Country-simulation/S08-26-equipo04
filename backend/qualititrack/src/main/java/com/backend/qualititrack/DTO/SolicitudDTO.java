package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.EstadoSolicitud;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/*@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudDTO {
    @NotNull(message = "El ID del cliente no puede ser nulo")
    private Long clienteId;

    private String clienteNombre;

    @NotBlank(message = "La descripción no puede estar vacía")
    private String descripcion;

    @NotNull(message = "El estado no puede ser nulo")
    private EstadoSolicitud estado;

    private String planoUrl;

    private LocalDateTime fechaVencimiento;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
}*/
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder @Getter @Setter
public class SolicitudDTO {
    private Long id;

    @NotNull(message = "El ID del cliente no puede ser nulo")
    private Long clienteId;

    public Long getClienteId() {
        return clienteId;
    }

    private String planoUrl;

    private String numeroSolicitud;

    @NotNull(message = "La fecha no puede ser nula")
    private LocalDateTime fechaEsperadaEntrega;

    @NotBlank(message = "La descripción de la pieza no puede estar vacía")
    private String descripcionPieza;

    @Min(value = 1, message = "Debe pedirse al menos una unidad de la pieza")
    private int cantidad;

    private String notasComerciales;

    private EstadoSolicitud estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getNumeroSolicitud() {
        return numeroSolicitud;
    }

    public void setNumeroSolicitud(String numeroSolicitud) {
        this.numeroSolicitud = numeroSolicitud;
    }

    public LocalDateTime getFechaEsperadaEntrega() {
        return fechaEsperadaEntrega;
    }

    public void setFechaEsperadaEntrega(LocalDateTime fechaEsperadaEntrega) {
        this.fechaEsperadaEntrega = fechaEsperadaEntrega;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public String getDescripcionPieza() {
        return descripcionPieza;
    }

    public void setDescripcionPieza(String descripcionPieza) {
        this.descripcionPieza = descripcionPieza;
    }

    public String getNotasComerciales() {
        return notasComerciales;
    }

    public void setNotasComerciales(String notasComerciales) {
        this.notasComerciales = notasComerciales;
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }
}
