package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;
import com.backend.qualititrack.Enum.EstadoOT;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenTrabajoResumenDTO {
    private Long id;
    private String numeroOt;
    private String cliente;
    private EstadoOT estado;
    private OffsetDateTime fecha;

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

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public EstadoOT getEstado() {
        return estado;
    }

    public void setEstado(EstadoOT estado) {
        this.estado = estado;
    }

    public OffsetDateTime getFecha() {
        return fecha;
    }

    public void setFecha(OffsetDateTime fecha) {
        this.fecha = fecha;
    }
}