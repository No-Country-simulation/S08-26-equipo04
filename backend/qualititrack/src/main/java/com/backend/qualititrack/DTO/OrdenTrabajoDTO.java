package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.Enum.EstadoOT;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Revisar para que coincida con base (ver entidad en "modelos")
public class OrdenTrabajoDTO {
    private Long id;

    @NotNull(message = "El ID de cotización no puede ser nulo")
    private Long cotizacionId;

    private String numeroOT;

    @NotNull(message = "El estado no puede ser nulo")
    private EstadoOT estado;

    @NotBlank(message = "La descripción no puede estar vacía")
    private String descripcion;

    @NotNull(message = "La fecha de vencimiento no puede ser nula")
    private OffsetDateTime fechaVencimiento;

    @NotNull(message = "La prioridad no puede ser nula")
    @Min(value = 1, message = "Prioridad mínima: 1")
    @Max(value = 5, message = "Prioridad máxima: 5")
    private Integer prioridad;

    private String observaciones;

    private OffsetDateTime fechaCreacion;

    private OffsetDateTime fechaActualizacion;

    private OffsetDateTime fechaInicioReal;

    private OffsetDateTime fechaTerminoReal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCotizacionId() {
        return cotizacionId;
    }

    public void setCotizacionId(Long cotizacionId) {
        this.cotizacionId = cotizacionId;
    }

    public EstadoOT getEstado() {
        return estado;
    }

    public void setEstado(EstadoOT estado) {
        this.estado = estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getNumeroOT() {
        return numeroOT;
    }

    public void setNumeroOT(String numeroOT) {
        this.numeroOT = numeroOT;
    }

    public OffsetDateTime getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(OffsetDateTime fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Integer getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(Integer prioridad) {
        this.prioridad = prioridad;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public OffsetDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(OffsetDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public OffsetDateTime getFechaTerminoReal() {
        return fechaTerminoReal;
    }

    public void setFechaTerminoReal(OffsetDateTime fechaTerminoReal) {
        this.fechaTerminoReal = fechaTerminoReal;
    }

    public OffsetDateTime getFechaInicioReal() {
        return fechaInicioReal;
    }

    public void setFechaInicioReal(OffsetDateTime fechaInicioReal) {
        this.fechaInicioReal = fechaInicioReal;
    }
}
