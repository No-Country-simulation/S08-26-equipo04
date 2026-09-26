package com.qualitytrack.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
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
public class CotizacionDTO {
    private Long id;
    private String numeroCotizacion;


    @NotNull(message = "Solicitud requerida")
    private Long solicitudId;
    //public Long getSolicitudId(){
    //    return getSolicitudId();
    //}

    @NotNull(message = "Jefe de Producción requerido")
    private Long jefeProduccionId;

    public Long getJefeProduccionId() {
        return jefeProduccionId;
    }

    public void setJefeProduccionId(Long jefeProduccionId) {
        this.jefeProduccionId = jefeProduccionId;
    }
    public Long getSolicitudId() {
        return solicitudId;
    }

    public void setSolicitudId(Long solicitudId) {
        this.solicitudId = solicitudId;
    }

    @NotNull(message = "Precio requerido")
    @DecimalMin(value = "0.01")
    private BigDecimal precioTotal;

    public BigDecimal getPrecioTotal() {
        return precioTotal;
    }

    public void setPrecioTotal(BigDecimal precioTotal) {
        this.precioTotal = precioTotal;
    }

    private String estado;  // o Enum EstadoCotizacion

    private String observaciones;

    private LocalDateTime fechaVencimiento;
    private LocalDateTime fechaEnvioCliente;
    private LocalDateTime fechaRespuestaCliente;
    private String motivoRechazo;

    private LocalDateTime fechaCreacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroCotizacion() {
        return numeroCotizacion;
    }

    public void setNumeroCotizacion(String numeroCotizacion) {
        this.numeroCotizacion = numeroCotizacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public LocalDateTime getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDateTime fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public LocalDateTime getFechaEnvioCliente() {
        return fechaEnvioCliente;
    }

    public void setFechaEnvioCliente(LocalDateTime fechaEnvioCliente) {
        this.fechaEnvioCliente = fechaEnvioCliente;
    }

    public LocalDateTime getFechaRespuestaCliente() {
        return fechaRespuestaCliente;
    }

    public void setFechaRespuestaCliente(LocalDateTime fechaRespuestaCliente) {
        this.fechaRespuestaCliente = fechaRespuestaCliente;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}