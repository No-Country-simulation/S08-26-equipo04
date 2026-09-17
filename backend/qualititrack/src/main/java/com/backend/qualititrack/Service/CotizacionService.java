package com.backend.qualititrack.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.qualititrack.DTO.CotizacionDTO;
import com.backend.qualititrack.DTO.CotizacionFaseDTO;
import com.backend.qualititrack.Enum.EstadoCotizacion;
import com.backend.qualititrack.modelos.Cotizacion;
import com.backend.qualititrack.modelos.CotizacionFase;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.CotizacionRepository;
import com.backend.qualititrack.repository.FaseRepository;
import com.backend.qualititrack.repository.SolicitudRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

@Service
@Transactional
public class CotizacionService {

    @Autowired
    private CotizacionRepository cotizacionRepository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private OrdenTrabajoService ordenTrabajoService;

    @Autowired
    private FaseRepository faseRepository;

    /**
     * 1. CREAR - JEFE_PRODUCCION crea cotización
     * Estado inicial: LISTA_PARA_ENVIAR
     * Fecha vencimiento: hoy + 30 días
     */
    public CotizacionDTO crear(CotizacionDTO dto, Long jefeId) {

        // Validar solicitud existe
        Solicitud solicitud = solicitudRepository.findById(dto.getSolicitudId())
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        // Validar que no exista cotización previa (una sola por solicitud)
        if (cotizacionRepository.findBySolicitudId(dto.getSolicitudId()).isPresent()) {
            throw new IllegalArgumentException("Ya existe cotización para esta solicitud");
        }

        // Validar precio
        if (dto.getPrecioTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }

        // Validar existencia de fases en el request
        if (dto.getFases() == null || dto.getFases().isEmpty()) {
            throw new IllegalArgumentException("La cotización debe incluir al menos una fase");
        }

        // Validar que el usuario es JEFE_PRODUCCION
        Usuario jefe = usuarioRepository.findById(jefeId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!jefe.getRol().toString().equals("JEFE_PRODUCCION")) {
            throw new IllegalArgumentException("Solo Jefe de Producción puede crear cotizaciones");
        }

        // Validar unicidad del número de secuencia
        java.util.Set<Integer> secuencias = new java.util.HashSet<>();
        for (CotizacionFaseDTO f : dto.getFases()) {
            if (!secuencias.add(f.getNumeroSecuencia())) {
                throw new IllegalArgumentException(
                        "El número de secuencia no puede repetirse: " + f.getNumeroSecuencia());
            }
        }

        // Crear cotización
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setNumeroCotizacion(generarNumeroCotizacion());
        cotizacion.setSolicitud(solicitud);
        cotizacion.setJefeProduccion(jefe);
        cotizacion.setPrecioFinal(dto.getPrecioTotal());
        cotizacion.setEstado(EstadoCotizacion.LISTA_PARA_ENVIAR);
        cotizacion.setObservaciones(dto.getObservaciones());

        // Calcular fecha vencimiento: hoy + 30 días
        // cotizacion.setFechaVencimiento(LocalDateTime.now().plusDays(30));

        cotizacion.setFechaCreacion(LocalDateTime.now());
        cotizacion.setFechaActualizacion(LocalDateTime.now());

        // Construir y vincular las fases
        for (CotizacionFaseDTO faseDto : dto.getFases()) {
            com.backend.qualititrack.modelos.FaseCatalogo catalogo = faseRepository
                    .findById(faseDto.getFaseCatalogoId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Fase de catálogo no encontrada: " + faseDto.getFaseCatalogoId()));

            CotizacionFase cf = new CotizacionFase();
            cf.setCotizacion(cotizacion); // Relación bidireccional (dueño)
            cf.setFaseCatalogo(catalogo);
            cf.setNumeroSecuencia(faseDto.getNumeroSecuencia());
            cf.setTiempoEstimadoMinutos(faseDto.getTiempoEstimadoMinutos());
            cf.setInstruccionesFase(faseDto.getInstruccionesFase());
            cf.setCreatedAt(java.time.OffsetDateTime.now());

            cotizacion.getFases().add(cf);
        }

        Cotizacion guardada = cotizacionRepository.save(cotizacion);
        return convertirADTO(guardada);
    }

    /**
     * 2. OBTENER POR ID
     */
    @Transactional(readOnly = true)
    public CotizacionDTO obtenerPorId(Long id) {
        Cotizacion cot = cotizacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cotización no encontrada"));
        return convertirADTO(cot);
    }

    /**
     * 3. OBTENER POR SOLICITUD (una sola)
     */
    @Transactional(readOnly = true)
    public CotizacionDTO obtenerPorSolicitud(Long solicitudId) {
        Cotizacion cot = cotizacionRepository.findBySolicitudId(solicitudId)
                .orElseThrow(() -> new IllegalArgumentException("No existe cotización para esta solicitud"));
        return convertirADTO(cot);
    }

    /**
     * 4. LISTAR PENDIENTES (estado LISTA_PARA_ENVIAR)
     * Para que JEFE_PRODUCCION vea cuáles están listas
     */
    @Transactional(readOnly = true)
    public List<CotizacionDTO> listarPendientes() {
        return cotizacionRepository.findByEstado(EstadoCotizacion.LISTA_PARA_ENVIAR).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * 5. ENVIAR AL CLIENTE - VENDEDOR envía
     * Cambia estado: LISTA_PARA_ENVIAR → ENVIADA_A_CLIENTE
     */
    @Transactional
    public CotizacionDTO enviarAlCliente(Long cotizacionId, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new IllegalArgumentException("Solo vendedores pueden enviar cotizaciones");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.LISTA_PARA_ENVIAR)) {
            throw new IllegalArgumentException("Cotización no está lista para enviar");
        }

        cot.setEstado(EstadoCotizacion.ENVIADA_A_CLIENTE);
        cot.setFechaEnvioCliente(LocalDateTime.now());

        Cotizacion actualizada = cotizacionRepository.save(cot);
        return convertirADTO(actualizada);
    }

    /**
     * 6. APROBAR COTIZACIÓN - VENDEDOR confirma aprobación
     * Cambia estado: ENVIADA_A_CLIENTE → APROBADA
     * ⚡ DISPARA: Generación automática de OrdenTrabajo
     */
    @Transactional
    public CotizacionDTO aprobarCotizacion(Long cotizacionId, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new IllegalArgumentException("Solo vendedores pueden aprobar cotizaciones");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.ENVIADA_A_CLIENTE)) {
            throw new IllegalArgumentException("Cotización no está en estado ENVIADA_A_CLIENTE");
        }

        cot.setEstado(EstadoCotizacion.APROBADA);
        cot.setFechaRespuestaCliente(LocalDateTime.now());

        Cotizacion actualizada = cotizacionRepository.save(cot);

        // ⚡ TRIGGER: Generar OrdenTrabajo automáticamente
        try {
            ordenTrabajoService.generarDesdeCotzacion(actualizada.getId());
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Orden de Trabajo: " + e.getMessage());
        }

        return convertirADTO(actualizada);
    }

    /**
     * 7. RECHAZAR COTIZACIÓN - VENDEDOR confirma rechazo
     * Cambia estado: ENVIADA_A_CLIENTE → NO_APROBADA
     */
    @Transactional
    public CotizacionDTO rechazarCotizacion(Long cotizacionId, String motivo, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new IllegalArgumentException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new IllegalArgumentException("Solo vendedores pueden rechazar cotizaciones");
        }

        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("Debe ingresar motivo del rechazo");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.ENVIADA_A_CLIENTE)) {
            throw new IllegalArgumentException("Solo se puede rechazar si está ENVIADA_A_CLIENTE");
        }

        cot.setEstado(EstadoCotizacion.NO_APROBADA);
        cot.setFechaRespuestaCliente(LocalDateTime.now());
        cot.setMotivoRechazoCliente(motivo);

        Cotizacion actualizada = cotizacionRepository.save(cot);
        return convertirADTO(actualizada);

    }

    private String generarNumeroCotizacion() {
        int ano = java.time.Year.now().getValue();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("COT-%d-%04d", ano, timestamp);
    }

    private CotizacionDTO convertirADTO(Cotizacion cotizacion) {
        CotizacionDTO dto = new CotizacionDTO();
        dto.setId(cotizacion.getId());
        dto.setNumeroCotizacion(cotizacion.getNumeroCotizacion());
        dto.setSolicitudId(cotizacion.getSolicitud().getId());
        dto.setPrecioTotal(cotizacion.getPrecioFinal());
        dto.setEstado(cotizacion.getEstado().toString());
        dto.setObservaciones(cotizacion.getObservaciones());
        // dto.setFechaVencimiento(cotizacion.getFechaVencimiento());
        dto.setJefeProduccionId(cotizacion.getJefeProduccion().getId());
        dto.setFechaEnvioCliente(cotizacion.getFechaEnvioCliente());
        dto.setFechaRespuestaCliente(cotizacion.getFechaRespuestaCliente());
        dto.setMotivoRechazo(cotizacion.getMotivoRechazoCliente());

        // Incorporar contenido de fases al DTO
        List<CotizacionFaseDTO> fasesDto = cotizacion.getFases().stream().map(f -> {
            CotizacionFaseDTO fd = new CotizacionFaseDTO();
            fd.setFaseCatalogoId(f.getFaseCatalogo().getId());
            fd.setNombreFase(f.getFaseCatalogo().getNombre());
            fd.setNumeroSecuencia(f.getNumeroSecuencia());
            fd.setTiempoEstimadoMinutos(f.getTiempoEstimadoMinutos());
            fd.setInstruccionesFase(f.getInstruccionesFase());
            return fd;
        }).collect(Collectors.toList());

        dto.setFases(fasesDto);
        return dto;
    }
}