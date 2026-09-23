package com.backend.qualititrack.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.EntregaOtRequestDTO;
import com.backend.qualititrack.DTO.ExpedienteCompletoDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoResumenDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.modelos.Cotizacion;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.repository.CotizacionRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;

import jakarta.persistence.EntityNotFoundException;
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

        ordenTrabajo.setFechaVencimiento(cotizacion.getFechaVencimiento());  // Copiar desde cotización
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

    /**
     * Marca una Orden de Trabajo como entregada (Issue #91)
     */
    @Transactional
    public OrdenTrabajoDTO marcarComoEntregada(Long id, EntregaOtRequestDTO request) {
        OrdenTrabajo ot = ordenTrabajoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("La Orden de Trabajo con ID " + id + " no existe"));

        // Validar que la OT esté en estado DESPACHO
        if (ot.getEstado() != EstadoOT.DESPACHO) {
            throw new IllegalStateException("La Orden de Trabajo no se encuentra en estado DESPACHO y no puede ser entregada.");
        }

        // Actualizar el estado y los campos de entrega
        ot.setEstado(EstadoOT.ENTREGADA);
        ot.setFechaEntrega(LocalDateTime.now());
        ot.setReceptorNombre(request.getReceptorNombre());

        OrdenTrabajo otGuardada = ordenTrabajoRepository.save(ot);
        
        // Retornar convertido a DTO (según el método de mapeo que use tu servicio)
        return convertirADTO(otGuardada); // Asegúrate de usar el método de mapeo a DTO que ya tengas en tu servicio
    }

    /**
     * 1. LISTAR O FILTRAR ORDENES DE TRABAJO (Para que el vendedor elija el expediente)
     */
    @Transactional()
    public List<OrdenTrabajoResumenDTO> listarConFiltros(String cliente, String numeroOt) {
        List<OrdenTrabajo> ordenes = ordenTrabajoRepository.findAll();

        return ordenes.stream()
            .filter(ot -> {
                boolean coincideCliente = (cliente == null || cliente.isBlank()) || 
                    (ot.getCliente() != null && ot.getCliente().getRazonSocial().toLowerCase().contains(cliente.toLowerCase()));
                
                boolean coincideNumero = (numeroOt == null || numeroOt.isBlank()) || 
                    (ot.getNumeroOt() != null && ot.getNumeroOt().toLowerCase().contains(numeroOt.toLowerCase()));
                
                return coincideCliente && coincideNumero;
            })
            .map(ot -> {
                OrdenTrabajoResumenDTO dto = new OrdenTrabajoResumenDTO();
                dto.setId(ot.getId());
                dto.setNumeroOt(ot.getNumeroOt());
                dto.setCliente(ot.getCliente() != null ? ot.getCliente().getRazonSocial() : "Sin cliente");
                dto.setEstado(ot.getEstado());
                dto.setFecha(ot.getFechaCreacion());
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * OBTENER EXPEDIENTE COMPLETO (Trazabilidad detallada de la OT)
     */
    @Transactional()
    public ExpedienteCompletoDTO obtenerExpedienteCompleto(Long id) {
        OrdenTrabajo ot = ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La Orden de Trabajo con ID " + id + " no existe"));

        ExpedienteCompletoDTO expediente = new ExpedienteCompletoDTO();
        
        // Asignar datos básicos
        expediente.setId(ot.getId());
        expediente.setNumeroOt(ot.getNumeroOt());
        expediente.setEstado(ot.getEstado());
        expediente.setFechaCreacion(ot.getFechaCreacion());
        expediente.setFechaEntrega(ot.getFechaEntrega());
        expediente.setReceptorNombre(ot.getReceptorNombre());

        // Mapear cotización y solicitud de forma segura
        if (ot.getCotizacion() != null) {
            expediente.getCotizacionId(); // o cotizacion.getId()
            expediente.setMontoTotal(ot.getCotizacion().getPrecioFinal().doubleValue());
            
            if (ot.getCotizacion().getSolicitud() != null) {
                expediente.setSolicitudId(ot.getCotizacion().getSolicitud().getId());
                if (ot.getCotizacion().getSolicitud().getCliente() != null) {
                    expediente.setClienteNombre(ot.getCotizacion().getSolicitud().getCliente().getRazonSocial());
                }
            }
        }

        // Manejo de secciones futuras/vacías sin inventar datos (criterio de aceptación)
        expediente.setHistorialFases(List.of()); // Lista vacía si aún no hay fases registradas
        expediente.setResultadoCalidad("Pendiente"); // Indicador claro de estado pendiente

        return expediente;
    }
}
