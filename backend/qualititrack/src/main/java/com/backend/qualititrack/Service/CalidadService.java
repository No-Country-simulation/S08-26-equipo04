package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.AuditoriaDetalleDTO;
import com.backend.qualititrack.DTO.CalidadConformidadDTO;
import com.backend.qualititrack.DTO.CalidadResponseDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.DTO.RespuestaChecklistItemDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Enum.ResultadoCalidad;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.exception.InvalidStateException;
import com.backend.qualititrack.modelos.AuditoriaCalidad;
import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta;
import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta.ResultadoItem;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.AuditoriaCalidadRepository;
import com.backend.qualititrack.repository.AuditoriaChecklistRespuestaRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CalidadService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;

    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    private final AuditoriaChecklistRespuestaRepository auditoriaChecklistRespuestaRepository;

    private final UsuarioRepository usuarioRepository;

    public CalidadService(OrdenTrabajoRepository ordenTrabajoRepository,
            AuditoriaCalidadRepository auditoriaCalidadRepository, AuditoriaChecklistRespuestaRepository auditoriaChecklistRespuestaRepository, UsuarioRepository usuarioRepository) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.auditoriaChecklistRespuestaRepository = auditoriaChecklistRespuestaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private static final Map<Integer, String> CRITERIOS = Map.of(
            1, "Conformidad dimensional",
            2, "Fases completas",
            3, "Terminación/acabado",
            4, "Cantidad",
            5, "Identificación",
            6, "Prueba funcional",
            7, "Documentación de respaldo");

    @Transactional
    public CalidadResponseDTO marcarConforme(Long otId, CalidadConformidadDTO dto, String emailAuditor,
            ResultadoCalidad resultado) {
        // Validar OT existe
        OrdenTrabajo ot = ordenTrabajoRepository.findById(otId)
                .orElseThrow(() -> new EntityNotFoundException("OT no encontrada"));

        // Validar OT está en calidad
        if (ot.getEstado() != EstadoOT.EN_CALIDAD) {
            throw new InvalidStateException("La OT debe estar en estado EN_CALIDAD");
        }

        // Validar exactamente 7 respuestas, con número diferente
        List<RespuestaChecklistItemDTO> respuestas = dto.getRespuestas();
        long itemsDistintos = respuestas.stream().map(RespuestaChecklistItemDTO::getItemNumero).distinct().count();
        if (itemsDistintos != 7 || respuestas.stream().anyMatch(r -> r.getResultadoItem() == null)) {
            throw new IllegalArgumentException("Debe proporcionar exactamente 7 respuestas distintas y válidas");
        }

        // Validar resultado (conforme cumple todas, no conforme tiene observaciones)
        boolean hayNoCumple = respuestas.stream()
                .anyMatch(r -> r.getResultadoItem() == ResultadoItem.NO_CUMPLE);
        if (resultado == ResultadoCalidad.CONFORME && hayNoCumple) {
            throw new InvalidStateException("No se puede dar CONFORME si algún punto no cumple");
        }

        if (resultado == ResultadoCalidad.NO_CONFORME
                && (dto.getObservacionesGenerales() == null || dto.getObservacionesGenerales().isBlank())) {
            throw new IllegalArgumentException("Las observaciones son obligatorias en un veredicto NO CONFORME");
        }

        // Buscar auditor en BD por email
        Usuario auditor = usuarioRepository.findByEmail(emailAuditor)
                .orElseThrow(() -> new EntityNotFoundException("Usuario auditor no encontrado: " + emailAuditor));

        // Ver número de auditoria (verificando si hay auditorías previas para la OT)
        int numero = auditoriaCalidadRepository.findFirstByOrdenTrabajoIdOrderByNumeroAuditoriaDesc(otId)
                .map(a -> a.getNumeroAuditoria() + 1)
                .orElse(1);

        // Generar auditoría y respuestas
        OffsetDateTime ahora = OffsetDateTime.now();
        AuditoriaCalidad auditoria = new AuditoriaCalidad();
        auditoria.setOrdenTrabajo(ot);
        auditoria.setAuditor(auditor);
        auditoria.setNumeroAuditoria(numero);
        auditoria.setResultado(resultado);
        auditoria.setObservacionesGenerales(dto.getObservacionesGenerales());
        auditoria.setFechaVeredicto(ahora);
        auditoria.setCreatedAt(ahora);
        auditoria.setRespuestas(new ArrayList<>());

        // 7. Agregar respuestas (7 items)
        for (RespuestaChecklistItemDTO item : dto.getRespuestas()) {
            AuditoriaChecklistRespuesta respuesta = new AuditoriaChecklistRespuesta();
            respuesta.setAuditoria(auditoria);
            respuesta.setItemNumero(item.getItemNumero());
            respuesta.setCriterioNombre(CRITERIOS.get(item.getItemNumero()));
            respuesta.setResultadoItem(item.getResultadoItem());
            respuesta.setObservaciones(item.getObservaciones());
            auditoria.getRespuestas().add(respuesta);
        }

        // 8. Guardar en BD
        AuditoriaCalidad auditoriaGuardada = auditoriaCalidadRepository.save(auditoria);

        // Actualizar OT
        if (resultado == ResultadoCalidad.CONFORME) {
            ot.setEstado(EstadoOT.DESPACHO);
            ot.setFechaPaseDespacho(ahora);
        } else {
            ot.setEstado(EstadoOT.NO_CONFORME);
        }
        ordenTrabajoRepository.save(ot);

        // 10. Retornar respuesta
        return new CalidadResponseDTO(
                auditoriaGuardada.getId(),
                ot.getId(),
                auditoriaGuardada.getResultado().name(),
                auditoriaGuardada.getObservacionesGenerales(),
                auditoriaGuardada.getFechaVeredicto(),
                auditoriaGuardada.getRespuestas().size());
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
     * Busca la última auditoría de la OT.
     */
    public AuditoriaDetalleDTO obtenerUltimaAuditoria(Long ordenTrabajoId) {
        if (!ordenTrabajoRepository.existsById(ordenTrabajoId)) {
            throw new EntityNotFoundException("OT no encontrada con ID: " + ordenTrabajoId);
        }
        AuditoriaCalidad a = auditoriaCalidadRepository.findFirstByOrdenTrabajoIdOrderByNumeroAuditoriaDesc(ordenTrabajoId)
                .orElseThrow(() -> new EntityNotFoundException("La OT todavía no tiene auditorías"));

        return AuditoriaDetalleDTO.builder()
                .numeroAuditoria(a.getNumeroAuditoria())
                .resultado(a.getResultado())
                .observacionesGenerales(a.getObservacionesGenerales())
                .fechaVeredicto(a.getFechaVeredicto())
                .auditorNombre(a.getAuditor().getNombre())
                .respuestas(auditoriaChecklistRespuestaRepository.findByAuditoriaIdOrderByItemNumero(a.getId()).stream()
                        .map(r -> new AuditoriaDetalleDTO.Item(
                                r.getItemNumero(), r.getCriterioNombre(), r.getResultadoItem(), r.getObservaciones()))
                        .toList())
                .build();
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
        dto.setFechaInicioProduccion(ordenTrabajo.getFechaInicioProduccion());
        dto.setFechaTerminoReal(ordenTrabajo.getFechaEntrega());
        dto.setReceptorNombre(ordenTrabajo.getReceptorNombre());
        dto.setFechaPaseCalidad(ordenTrabajo.getFechaPaseCalidad());
        dto.setFechaPaseDespacho(ordenTrabajo.getFechaPaseDespacho());

        if (ordenTrabajo.getCotizacion() != null) {
            dto.setCotizacionId(ordenTrabajo.getCotizacion().getId());
        }

        return dto;
    }
}