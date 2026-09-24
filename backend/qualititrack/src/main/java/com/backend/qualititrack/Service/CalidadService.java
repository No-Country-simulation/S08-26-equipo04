package com.backend.qualititrack.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CalidadService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public CalidadService(OrdenTrabajoRepository ordenTrabajoRepository) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    /**
     * Obtiene las órdenes de trabajo que están pendientes de auditoría.
     *
     * Una OT está pendiente de auditoría cuando su estado es EN_CALIDAD.
     */
    public List<OrdenTrabajoDTO> listarPendientesAuditoria() {
        return ordenTrabajoRepository.findByEstado(EstadoOT.EN_CALIDAD)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    /**
     * Convierte una OrdenTrabajo a DTO para exponerla mediante la API.
     */
    private OrdenTrabajoDTO convertirADTO(OrdenTrabajo ordenTrabajo) {
        OrdenTrabajoDTO dto = new OrdenTrabajoDTO();

        dto.setId(ordenTrabajo.getId());
        dto.setNumeroOT(ordenTrabajo.getNumeroOt());
        dto.setEstado(ordenTrabajo.getEstado());
        dto.setFechaCreacion(ordenTrabajo.getCreatedAt());
        dto.setFechaTerminoReal(ordenTrabajo.getFechaEntrega());

        if (ordenTrabajo.getCotizacion() != null) {
            dto.setCotizacionId(ordenTrabajo.getCotizacion().getId());
        }

        return dto;
    }
}