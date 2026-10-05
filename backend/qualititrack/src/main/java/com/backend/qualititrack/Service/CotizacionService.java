package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.qualititrack.DTO.CotizacionFaseDTO;
import com.backend.qualititrack.DTO.CotizacionRequestDTO;
import com.backend.qualititrack.DTO.CotizacionResponseDTO;
import com.backend.qualititrack.Enum.EstadoCotizacion;
import com.backend.qualititrack.Enum.EstadoSolicitud;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.exception.InvalidStateException;
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
    public CotizacionResponseDTO crear(CotizacionRequestDTO dto, Long jefeId) {

        // Validar solicitud existe
        Solicitud solicitud = solicitudRepository.findById(dto.getSolicitudId())
                .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada"));

        // Validar que no exista cotización previa (una sola por solicitud)
        if (cotizacionRepository.findBySolicitudId(dto.getSolicitudId()).isPresent()) {
            throw new InvalidStateException("Ya existe cotización para esta solicitud");
        }
        // Validar que el usuario es JEFE_PRODUCCION
        Usuario jefe = usuarioRepository.findById(jefeId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!jefe.getRol().toString().equals("JEFE_PRODUCCION")) {
            throw new AccessDeniedException("Solo Jefe de Producción puede crear cotizaciones");
        }

        // Validar unicidad del número de secuencia
        java.util.Set<Integer> secuencias = new java.util.HashSet<>();
        for (CotizacionFaseDTO f : dto.getFases()) {
            if (!secuencias.add(f.getNumeroSecuencia())) {
                throw new InvalidStateException(
                        "El número de secuencia no puede repetirse: " + f.getNumeroSecuencia());
            }
        }

        // Crear cotización
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setNumeroCotizacion(generarNumeroCotizacion());
        cotizacion.setSolicitud(solicitud);
        cotizacion.setJefeProduccion(jefe);
        cotizacion.setPrecioFinal(dto.getPrecioFinal());
        cotizacion.setEstado(EstadoCotizacion.LISTA_PARA_ENVIAR);
        cotizacion.setObservaciones(dto.getObservaciones());

        // Calcular fecha vencimiento: hoy + 30 días
        // cotizacion.setFechaVencimiento(OffsetDateTime.now().plusDays(30));

        cotizacion.setFechaCreacion(OffsetDateTime.now());
        cotizacion.setFechaActualizacion(OffsetDateTime.now());

        // Construir y vincular las fases
        for (CotizacionFaseDTO faseDto : dto.getFases()) {
            com.backend.qualititrack.modelos.FaseCatalogo catalogo = faseRepository
                    .findById(faseDto.getFaseCatalogoId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Fase de catálogo no encontrada: " + faseDto.getFaseCatalogoId()));

            CotizacionFase cf = new CotizacionFase();
            cf.setCotizacion(cotizacion); // Relación bidireccional (dueño)
            cf.setFaseCatalogo(catalogo);
            cf.setNumeroSecuencia(faseDto.getNumeroSecuencia());
            cf.setTiempoEstimadoMinutos(faseDto.getTiempoEstimadoMinutos());
            cf.setInstruccionesFase(faseDto.getInstruccionesFase());
            cf.setCreatedAt(OffsetDateTime.now());

            cotizacion.getFases().add(cf);
        }

        Cotizacion guardada = cotizacionRepository.save(cotizacion);
        
        // Actualizar solicitud para reflejar que ahora está cotizada
        solicitud.setEstado(EstadoSolicitud.COTIZADA);
        solicitud.setUpdatedAt(OffsetDateTime.now());
        solicitudRepository.save(solicitud);

        return convertirADTO(guardada);
    }

    /**
     * 2. OBTENER POR ID
     */
    @Transactional(readOnly = true)
    public CotizacionResponseDTO obtenerPorId(Long id) {
        Cotizacion cot = cotizacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));
        return convertirADTO(cot);
    }

    /**
     * 3. OBTENER POR SOLICITUD (una sola)
     */
    @Transactional(readOnly = true)
    public CotizacionResponseDTO obtenerPorSolicitud(Long solicitudId) {
        Cotizacion cot = cotizacionRepository.findBySolicitudId(solicitudId)
                .orElseThrow(() -> new EntityNotFoundException("No existe cotización para esta solicitud"));
        return convertirADTO(cot);
    }

    /**
     * 4. LISTAR COTIZACIONES
     */
    @Transactional(readOnly = true)
    public List<CotizacionResponseDTO> listarCotizaciones() {
        return cotizacionRepository.findAllWithDetails().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * 5. ENVIAR AL CLIENTE - VENDEDOR envía
     * Cambia estado: LISTA_PARA_ENVIAR → ENVIADA_A_CLIENTE
     */
    @Transactional
    public CotizacionResponseDTO enviarAlCliente(Long cotizacionId, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new AccessDeniedException("Solo vendedores pueden enviar cotizaciones");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.LISTA_PARA_ENVIAR)) {
            throw new InvalidStateException("Cotización no está lista para enviar");
        }

        cot.setEstado(EstadoCotizacion.ENVIADA_A_CLIENTE);
        cot.setFechaEnvioCliente(OffsetDateTime.now());

        Cotizacion actualizada = cotizacionRepository.save(cot);
        return convertirADTO(actualizada);
    }

    /**
     * 6. APROBAR COTIZACIÓN - VENDEDOR confirma aprobación
     * Cambia estado: ENVIADA_A_CLIENTE → APROBADA
     * ⚡ DISPARA: Generación automática de OrdenTrabajo
     */
    @Transactional
    public CotizacionResponseDTO aprobarCotizacion(Long cotizacionId, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new AccessDeniedException("Solo vendedores pueden aprobar cotizaciones");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.ENVIADA_A_CLIENTE)) {
            throw new InvalidStateException("Cotización no está en estado ENVIADA_A_CLIENTE");
        }

        cot.setEstado(EstadoCotizacion.APROBADA);
        cot.setFechaRespuestaCliente(OffsetDateTime.now());

        Cotizacion actualizada = cotizacionRepository.save(cot);

        // Generar OT automáticamente
        ordenTrabajoService.generarDesdeCotizacion(actualizada.getId());

        return convertirADTO(actualizada);
    }

    /**
     * 7. RECHAZAR COTIZACIÓN - VENDEDOR confirma rechazo
     * Cambia estado: ENVIADA_A_CLIENTE → NO_APROBADA
     */
    @Transactional
    public CotizacionResponseDTO rechazarCotizacion(Long cotizacionId, String motivo, Long vendedorId) {

        Cotizacion cot = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado"));

        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new AccessDeniedException("Solo vendedores pueden rechazar cotizaciones");
        }

        if (!cot.getEstado().equals(EstadoCotizacion.ENVIADA_A_CLIENTE)) {
            throw new InvalidStateException("Solo se puede rechazar si está ENVIADA_A_CLIENTE");
        }

        cot.setEstado(EstadoCotizacion.NO_APROBADA);
        cot.setFechaRespuestaCliente(OffsetDateTime.now());
        cot.setMotivoRechazoCliente(motivo);

        Cotizacion actualizada = cotizacionRepository.save(cot);
        return convertirADTO(actualizada);

    }

    private String generarNumeroCotizacion() {
        int ano = java.time.Year.now().getValue();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("COT-%d-%04d", ano, timestamp);
    }

    private CotizacionResponseDTO convertirADTO(Cotizacion cotizacion) {
        CotizacionResponseDTO dto = new CotizacionResponseDTO();
        dto.setId(cotizacion.getId());
        dto.setNumeroCotizacion(cotizacion.getNumeroCotizacion());
        dto.setSolicitudId(cotizacion.getSolicitud().getId());
        dto.setPrecioFinal(cotizacion.getPrecioFinal());
        dto.setEstado(cotizacion.getEstado().toString());
        dto.setObservaciones(cotizacion.getObservaciones());
        // dto.setFechaVencimiento(cotizacion.getFechaVencimiento());
        dto.setJefeProduccionId(cotizacion.getJefeProduccion().getId());
        dto.setFechaEnvioCliente(cotizacion.getFechaEnvioCliente());
        dto.setFechaRespuestaCliente(cotizacion.getFechaRespuestaCliente());
        dto.setMotivoRechazoCliente(cotizacion.getMotivoRechazoCliente());
        dto.setFechaCreacion(cotizacion.getFechaCreacion());
        dto.setFechaActualizacion(cotizacion.getFechaActualizacion());
        dto.setSolicitudNumero(cotizacion.getSolicitud().getNumeroSolicitud());
        dto.setCantidad(cotizacion.getSolicitud().getCantidad());
        dto.setFechaEsperadaEntrega(cotizacion.getSolicitud().getFechaEsperadaEntrega());
        dto.setDescripcionPieza(cotizacion.getSolicitud().getDescripcionPieza());
        dto.setClienteRazonSocial(cotizacion.getSolicitud().getCliente().getRazonSocial());

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