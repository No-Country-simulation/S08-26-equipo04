package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;
import java.util.List;
import com.backend.qualititrack.Enum.EstadoOT;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteCompletoDTO {
    // Datos generales de la OT
    private Long id;
    private String numeroOt;
    private EstadoOT estado;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaEntrega;
    private String receptorNombre;

    // Solicitud y Cotización
    private Long solicitudId;
    private Long cotizacionId;
    private String clienteNombre;
    private Double montoTotal;

    // Historial de fases y reasignaciones (Secciones de trazabilidad)
    private List<FaseDetalleExpedienteDTO> historialFases;

    // Resultados de Calidad
    private String resultadoCalidad; // "Aprobado", "Rechazado", "Pendiente"

    // Getters y Setters explícitos
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroOt() {
        return numeroOt;
    }

    public void setNumeroOt(String numeroOt) {
        this.numeroOt = numeroOt;
    }

    public EstadoOT getEstado() {
        return estado;
    }

    public void setEstado(EstadoOT estado) {
        this.estado = estado;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public OffsetDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(OffsetDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public String getReceptorNombre() {
        return receptorNombre;
    }

    public void setReceptorNombre(String receptorNombre) {
        this.receptorNombre = receptorNombre;
    }

    public Long getSolicitudId() {
        return solicitudId;
    }

    public void setSolicitudId(Long solicitudId) {
        this.solicitudId = solicitudId;
    }

    public Long getCotizacionId() {
        return cotizacionId;
    }

    public void setCotizacionId(Long cotizacionId) {
        this.cotizacionId = cotizacionId;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public List<FaseDetalleExpedienteDTO> getHistorialFases() {
        return historialFases;
    }

    public void setHistorialFases(List<FaseDetalleExpedienteDTO> historialFases) {
        this.historialFases = historialFases;
    }

    public String getResultadoCalidad() {
        return resultadoCalidad;
    }

    public void setResultadoCalidad(String resultadoCalidad) {
        this.resultadoCalidad = resultadoCalidad;
    }
}