package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.EntregaOtRequestDTO;
import com.backend.qualititrack.DTO.ExpedienteCompletoDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoResumenDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Enum.EstadoOtFase;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.exception.InvalidStateException;
import com.backend.qualititrack.modelos.Cotizacion;
import com.backend.qualititrack.modelos.CotizacionFase;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.OtFase;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.CotizacionFaseRepository;
import com.backend.qualititrack.repository.CotizacionRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.OtFaseRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class OrdenTrabajoService {
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final CotizacionRepository cotizacionRepository;
    private final CotizacionFaseRepository cotizacionFaseRepository;
    private final OtFaseRepository otFaseRepository;
    private final UsuarioService usuarioService;

    public OrdenTrabajoService(OrdenTrabajoRepository ordenTrabajoRepository,
            CotizacionRepository cotizacionRepository,
            CotizacionFaseRepository cotizacionFaseRepository,
            OtFaseRepository otFaseRepository,
            UsuarioService usuarioService) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.cotizacionRepository = cotizacionRepository;
        this.cotizacionFaseRepository = cotizacionFaseRepository;
        this.otFaseRepository = otFaseRepository;
        this.usuarioService = usuarioService;
    }

    /**
     * GENERAR DESDE COTIZACIÓN (Auto-trigger cuando se aprueba cotización)
     */
    @Transactional
    public OrdenTrabajoDTO generarDesdeCotizacion(Long cotizacionId) {
        // Validar que la cotización existe
        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La cotización con ID " + cotizacionId + " no existe"));

        // Validar que no exista una orden de trabajo para esta cotización
        if (ordenTrabajoRepository.findByCotizacionId(cotizacionId).isPresent()) {
            throw new InvalidStateException(
                    "Ya existe una orden de trabajo para esta cotización");
        }

        // Crear orden de trabajo
        OrdenTrabajo ordenTrabajo = new OrdenTrabajo();
        ordenTrabajo.setNumeroOt(generarNumeroOrden());
        ordenTrabajo.setCotizacion(cotizacion);
        ordenTrabajo.setCantidad(cotizacion.getSolicitud().getCantidad());
        ordenTrabajo.setEstado(EstadoOT.EN_PRODUCCION);
        ordenTrabajo.setCreatedAt(OffsetDateTime.now());

        // Guardar fase de trabajo
        OrdenTrabajo guardada = ordenTrabajoRepository.save(ordenTrabajo);

        // Obtener fases de cotizacion y pasar para la OT
        List<CotizacionFase> fasesCotizacion = cotizacionFaseRepository
                .findByCotizacionIdOrderByNumeroSecuenciaAsc(cotizacionId);
        List<OtFase> fasesOt = new ArrayList<>();

        // Copiar la secuencia y aplicar la lógica de vencimiento
        for (CotizacionFase faseCot : fasesCotizacion) {
            OtFase nuevaFase = new OtFase();
            nuevaFase.setOrdenTrabajo(guardada);
            nuevaFase.setFaseCatalogo(faseCot.getFaseCatalogo());
            int numeroSecuencia = faseCot.getNumeroSecuencia();
            nuevaFase.setNumeroSecuencia(numeroSecuencia);
            nuevaFase.setTiempoEstimadoMinutos(faseCot.getTiempoEstimadoMinutos());
            nuevaFase.setEsRehacer(false);
            nuevaFase.setCicloIteracion(1);
            nuevaFase.setEstado(EstadoOtFase.PENDIENTE);

            // Asignar un operario
            Usuario operarioAsignado = usuarioService.obtenerOperarioHabilitado(faseCot.getFaseCatalogo().getId());
            nuevaFase.setOperario(operarioAsignado);

            // Lógica exclusiva para la PRIMERA fase de la secuencia
            if (numeroSecuencia == 1) {
                OffsetDateTime vencimiento = OffsetDateTime.now()
                        .plusMinutes(faseCot.getTiempoEstimadoMinutos());
                nuevaFase.setFechaVencimiento(vencimiento);
                guardada.setFechaInicioProduccion(OffsetDateTime.now());
                nuevaFase.setEstado(EstadoOtFase.EN_COLA);
            } else {
                nuevaFase.setFechaVencimiento(null);
            }
            fasesOt.add(nuevaFase);
        }
        otFaseRepository.saveAll(fasesOt);
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

        if (nuevoEstado == EstadoOT.COMPLETADA) {
            ordenTrabajo.setFechaEntrega(OffsetDateTime.now());
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
        dto.setFechaCreacion(ordenTrabajo.getCreatedAt());
        dto.setFechaTerminoReal(ordenTrabajo.getFechaEntrega());
        dto.setEstado(ordenTrabajo.getEstado());
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

        if (ot.getEstado() != EstadoOT.DESPACHO) {
            throw new IllegalStateException(
                    "La Orden de Trabajo no se encuentra en estado DESPACHO y no puede ser entregada.");
        }

        ot.setEstado(EstadoOT.ENTREGADA);
        ot.setFechaEntrega(OffsetDateTime.now());
        ot.setReceptorNombre(request.getReceptorNombre());

        OrdenTrabajo otGuardada = ordenTrabajoRepository.save(ot);
        return convertirADTO(otGuardada);
    }

    /**
     * 1. LISTAR O FILTRAR ORDENES DE TRABAJO (Para que el vendedor elija el
     * expediente)
     */
    @Transactional()
    public List<OrdenTrabajoResumenDTO> listarConFiltros(String cliente, String numeroOt) {
        List<OrdenTrabajo> ordenes = ordenTrabajoRepository.findAll();

        return ordenes.stream()
                .filter(ot -> {
                    String razonSocialCliente = "";
                    if (ot.getCotizacion() != null &&
                            ot.getCotizacion().getSolicitud() != null &&
                            ot.getCotizacion().getSolicitud().getCliente() != null) {
                        razonSocialCliente = ot.getCotizacion().getSolicitud().getCliente().getRazonSocial();
                    }

                    boolean coincideCliente = (cliente == null || cliente.isBlank()) ||
                            (!razonSocialCliente.isBlank()
                                    && razonSocialCliente.toLowerCase().contains(cliente.toLowerCase()));

                    boolean coincideNumero = (numeroOt == null || numeroOt.isBlank()) ||
                            (ot.getNumeroOt() != null
                                    && ot.getNumeroOt().toLowerCase().contains(numeroOt.toLowerCase()));

                    return coincideCliente && coincideNumero;
                })
                .map(ot -> {
                    OrdenTrabajoResumenDTO dto = new OrdenTrabajoResumenDTO();
                    dto.setId(ot.getId());
                    dto.setNumeroOt(ot.getNumeroOt());

                    String razonSocial = "Sin cliente";
                    if (ot.getCotizacion() != null &&
                            ot.getCotizacion().getSolicitud() != null &&
                            ot.getCotizacion().getSolicitud().getCliente() != null) {
                        razonSocial = ot.getCotizacion().getSolicitud().getCliente().getRazonSocial();
                    }

                    dto.setCliente(razonSocial);
                    dto.setEstado(ot.getEstado());
                    dto.setFecha(ot.getCreatedAt());
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

        expediente.setId(ot.getId());
        expediente.setNumeroOt(ot.getNumeroOt());
        expediente.setEstado(ot.getEstado());
        expediente.setFechaCreacion(ot.getCreatedAt());
        expediente.setFechaEntrega(ot.getFechaEntrega());
        expediente.setReceptorNombre(ot.getReceptorNombre());

        if (ot.getCotizacion() != null) {
            expediente.setMontoTotal(ot.getCotizacion().getPrecioFinal().doubleValue());

            if (ot.getCotizacion().getSolicitud() != null) {
                expediente.setSolicitudId(ot.getCotizacion().getSolicitud().getId());
                if (ot.getCotizacion().getSolicitud().getCliente() != null) {
                    expediente.setClienteNombre(ot.getCotizacion().getSolicitud().getCliente().getRazonSocial());
                }
            }
        }

        expediente.setHistorialFases(List.of());
        expediente.setResultadoCalidad("Pendiente");

        return expediente;
    }
}