package com.backend.qualititrack.DTO;

import java.time.LocalDateTime;
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
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEntrega;
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

    // Getters y Setters explícitos por si no usas Lombok activo
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

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<FaseDetalleExpedienteDTO> getHistorialFases() {
        return historialFases;
    }

    public void setHistorialFases(List<FaseDetalleExpedienteDTO> historialFases) {
        this.historialFases = historialFases;
    }
    // (Puedes agregar el resto de getters/setters o dejar que Lombok los genere con
    // @Data)
}