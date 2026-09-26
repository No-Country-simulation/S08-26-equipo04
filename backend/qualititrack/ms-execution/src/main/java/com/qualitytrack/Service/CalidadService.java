package com.qualitytrack.Service;

import com.qualitytrack.DTO.CalidadConformidadDTO;
import com.qualitytrack.DTO.CalidadResponseDTO;
import com.qualitytrack.DTO.RespuestaChecklistItemDTO;
import com.qualitytrack.modelos.AuditoriaCalidad;
import com.qualitytrack.modelos.AuditoriaChecklistRespuesta;
import com.qualitytrack.Enum.EstadoOT;
import com.qualitytrack.modelos.OrdenTrabajo;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.AuditoriaCalidadRepository;
import com.qualitytrack.repository.OrdenTrabajoRepository;
import com.qualitytrack.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;

@Service
public class CalidadService {
    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private AuditoriaCalidadRepository auditoriaCalidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

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
}