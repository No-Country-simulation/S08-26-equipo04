package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.CalidadConformidadDTO;
import com.backend.qualititrack.DTO.CalidadResponseDTO;
import com.backend.qualititrack.DTO.OrdenTrabajoDTO;
import com.backend.qualititrack.DTO.RespuestaChecklistItemDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.modelos.AuditoriaCalidad;
import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.AuditoriaCalidadRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CalidadService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;

    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    
    private final UsuarioRepository usuarioRepository;

    public CalidadService(OrdenTrabajoRepository ordenTrabajoRepository, AuditoriaCalidadRepository auditoriaCalidadRepository, UsuarioRepository usuarioRepository) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.usuarioRepository = usuarioRepository;
    }

@Transactional
    public CalidadResponseDTO marcarConforme(Long otId, CalidadConformidadDTO dto, String emailAuditor) {
        // 1. Validar OT existe
        OrdenTrabajo ot = ordenTrabajoRepository.findById(otId)
                .orElseThrow(() -> new EntityNotFoundException("OT no encontrada"));

        // 2. Validar OT está COMPLETADA
        EstadoOT estado = ot.getEstado();
        if (!estado.equals(EstadoOT.COMPLETADA)) {
            throw new IllegalStateException("La OT debe estar en estado COMPLETADA");
        }

        // 3. Validar exactamente 7 respuestas
        if (dto.getRespuestas().size() != 7) {
            throw new IllegalArgumentException("Debe proporcionar exactamente 7 respuestas");
        }

        // 4. Validar resultado
        String resultado = dto.getResultado() != null ? dto.getResultado().toUpperCase() : "";
        if (!resultado.equals("CONFORME") && !resultado.equals("NO_CONFORME")) {
            throw new IllegalArgumentException("Resultado debe ser CONFORME o NO_CONFORME");
        }

        // 5. Buscar auditor en BD por email
        Usuario auditor = usuarioRepository.findByEmail(emailAuditor)
                .orElseThrow(() -> new EntityNotFoundException("Usuario auditor no encontrado: " + emailAuditor));

        // 6. Crear AuditoriaCalidad
        AuditoriaCalidad auditoria = new AuditoriaCalidad();
        auditoria.setOrdenTrabajo(ot);
        auditoria.setAuditor(auditor);
        auditoria.setNumeroAuditoria(1);
        auditoria.setResultado(AuditoriaCalidad.Resultado.valueOf(resultado));
        auditoria.setObservacionesGenerales(dto.getObservacionesGenerales());
        auditoria.setFechaVeredicto(OffsetDateTime.now());
        auditoria.setCreatedAt(OffsetDateTime.now());
        auditoria.setRespuestas(new ArrayList<>());

        // 7. Agregar respuestas (7 items)
        for (RespuestaChecklistItemDTO item : dto.getRespuestas()) {
            AuditoriaChecklistRespuesta respuesta = new AuditoriaChecklistRespuesta();
            respuesta.setAuditoria(auditoria);
            respuesta.setItemNumero(item.getItemNumero());
            respuesta.setCriterioNombre("Criterio " + item.getItemNumero());
            respuesta.setResultadoItem(AuditoriaChecklistRespuesta.ResultadoItem.valueOf(item.getResultadoItem().toUpperCase()));
            respuesta.setObservaciones(item.getObservaciones());
            auditoria.getRespuestas().add(respuesta);
        }

        // 8. Guardar en BD
        AuditoriaCalidad auditoriaGuardada = auditoriaCalidadRepository.save(auditoria);

        // 9. Actualizar OT fecha pase calidad
        ot.setFechaPaseCalidad(OffsetDateTime.now());
        ordenTrabajoRepository.save(ot);

        // 10. Retornar respuesta
        return new CalidadResponseDTO(
                auditoriaGuardada.getId(),
                ot.getId(),
                auditoriaGuardada.getResultado().name(),
                auditoriaGuardada.getObservacionesGenerales(),
                auditoriaGuardada.getFechaVeredicto(),
                auditoriaGuardada.getRespuestas().size()
        );
    }

    @Transactional
    public CalidadResponseDTO marcarNoConforme(Long otId, CalidadConformidadDTO dto, String emailAuditor) {
        return marcarConforme(otId, dto, emailAuditor);
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