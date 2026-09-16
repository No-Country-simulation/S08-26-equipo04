package com.backend.qualititrack.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.modelos.Cotizacion;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.repository.CotizacionRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class OrdenTrabajoService {
    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private CotizacionRepository cotizacionRepository;

    /**
     * GENERAR DESDE COTIZACIÓN (Auto-trigger cuando se aprueba cotización)
     */
    public OrdenTrabajoDTO generarDesdeCotzacion(Long cotizacionId) {
        // Validar que la cotización existe
        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La cotización con ID " + cotizacionId + " no existe"));

        // Validar que no exista una orden de trabajo para esta cotización
        if (ordenTrabajoRepository.findByCotizacionId(cotizacionId).isPresent()) {
            throw new IllegalArgumentException(
                    "Ya existe una orden de trabajo para esta cotización");
        }

        // Crear orden de trabajo
        OrdenTrabajo ordenTrabajo = new OrdenTrabajo();
        ordenTrabajo.setNumeroOt(generarNumeroOrden());
        ordenTrabajo.setCotizacion(cotizacion);
        ordenTrabajo.setEstado(EstadoOT.PENDIENTE);
        ordenTrabajo.setFechaCreacion(LocalDateTime.now());

        // ordenTrabajo.setFechaVencimiento(cotizacion.getFechaVencimiento());  // Copiar desde cotización
        ordenTrabajo.setCliente(cotizacion.getSolicitud().getCliente());    //obtenemos el cliente

        OrdenTrabajo guardada = ordenTrabajoRepository.save(ordenTrabajo);
        return convertirADTO(guardada);
    }

    /**
     * OBTENER POR ID
     */
    @Transactional()
    public OrdenTrabajoDTO obtenerPorId(Long id) {
        OrdenTrabajo ordenTrabajo = ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La orden de trabajo con ID " + id + " no existe"));
        return convertirADTO(ordenTrabajo);
    }

    /**
     * OBTENER POR COTIZACIÓN
     */
    @Transactional()
    public OrdenTrabajoDTO obtenerPorCotizacion(Long cotizacionId) {
        OrdenTrabajo ordenTrabajo = ordenTrabajoRepository.findByCotizacionId(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe orden de trabajo para la cotización con ID " + cotizacionId));
        return convertirADTO(ordenTrabajo);
    }

    /**
     * LISTAR POR ESTADO
     */
    @Transactional()
    public List<OrdenTrabajoDTO> listarPorEstado(EstadoOT estado) {
        return ordenTrabajoRepository.findAll().stream()
                .filter(ot -> ot.getEstado() == estado)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * ACTUALIZAR ESTADO
     */
    @Transactional
    public OrdenTrabajoDTO actualizarEstado(Long id, EstadoOT nuevoEstado) {
        OrdenTrabajo ordenTrabajo = ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La orden de trabajo con ID " + id + " no existe"));

        ordenTrabajo.setEstado(nuevoEstado);

        // Si el nuevo estado es COMPLETADA, registrar fecha de completación
        if (nuevoEstado == EstadoOT.COMPLETADA) {
            ordenTrabajo.setFechaTerminacion(LocalDateTime.now());
        }

        OrdenTrabajo actualizada = ordenTrabajoRepository.save(ordenTrabajo);
        return convertirADTO(actualizada);
    }

    /**
     * CANCELAR
     */
    @Transactional
    public OrdenTrabajoDTO cancelar(Long id, String motivo) {
        OrdenTrabajo ordenTrabajo = ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La orden de trabajo con ID " + id + " no existe"));

        ordenTrabajo.setEstado(EstadoOT.CANCELADA);
        ordenTrabajo.setNotas("Cancelada: " + motivo);

        OrdenTrabajo actualizada = ordenTrabajoRepository.save(ordenTrabajo);
        return convertirADTO(actualizada);
    }

    /**
     * Genera número de orden único con formato OT-YYYY-XXXX
     */
    private String generarNumeroOrden() {
        int ano = java.time.Year.now().getValue();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("OT-%d-%04d", ano, timestamp);
    }

    /**
     * Convierte OrdenTrabajo entity a OrdenTrabajoDTO
     */
    private OrdenTrabajoDTO convertirADTO(OrdenTrabajo ordenTrabajo) {
        OrdenTrabajoDTO dto = new OrdenTrabajoDTO();
        dto.setId(ordenTrabajo.getId());
        dto.setNumeroOT(ordenTrabajo.getNumeroOt());
        dto.setFechaCreacion(ordenTrabajo.getFechaCreacion());
        dto.setFechaTerminoReal(ordenTrabajo.getFechaTerminacion());
        dto.setEstado(ordenTrabajo.getEstado());
        dto.setDescripcion(ordenTrabajo.getNotas());
        dto.setCotizacionId(ordenTrabajo.getCotizacion().getId());
        return dto;
    }
}
