package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.OtNotaRequestDTO;
import com.backend.qualititrack.DTO.OtNotaResponseDTO;
import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.OtFase;
import com.backend.qualititrack.modelos.OtNota;
import com.backend.qualititrack.modelos.OtNota.OrigenNota;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.OtFaseRepository;
import com.backend.qualititrack.repository.OtNotaRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

@Service
public class OtNotaService {
    private final OtNotaRepository otNotaRepository;
    private final OtFaseService otFaseService;
    private final OtFaseRepository otFaseRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final UsuarioRepository usuarioRepository;

    public OtNotaService(OtNotaRepository otNotaRepository, OtFaseService otFaseService,
            OtFaseRepository otFaseRepository, OrdenTrabajoRepository ordenTrabajoRepository,
            UsuarioRepository usuarioRepository) {
        this.otNotaRepository = otNotaRepository;
        this.otFaseService = otFaseService;
        this.otFaseRepository = otFaseRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Endpoint: GET /api/ot-fases/{id}/notas
    // Consultar las notas en una fase de OT determinada.
    // Acceso: Jefe de producción y Operario asignado a la fase.
    public Map<String, List<OtNotaResponseDTO>> listarNotasFase(Long faseId, String usuarioMail) {
        // Obtener usuario
        Usuario usuario = usuarioRepository.findByEmail(usuarioMail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El usuario con email " + usuarioMail + " no existe"));

        // Validar rol de usuario
        NivelRol rolUsuario = usuario.getRol();

        if (rolUsuario == NivelRol.OPERARIO) {
            // Si es operario, hay que validar que pertenezca a la fase, o dar error de lo
            // contrario
            otFaseService.validarOperarioEnFase(faseId, usuario.getId());
        }
        // obtener las notas de la OTFase con el id pasado por parametro
        List<OtNotaResponseDTO> notas = otNotaRepository.findByOtFaseId(faseId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());

        // Agrupar las notas explícitamente para asegurar que ambas claves existan en el JSON
        Map<String, List<OtNotaResponseDTO>> notasAgrupadas = new HashMap<>();

        notasAgrupadas.put(OrigenNota.CALIDAD.name(), notas.stream()
                .filter(nota -> nota.getOrigen() == OrigenNota.CALIDAD)
                .collect(Collectors.toList()));
        notasAgrupadas.put(OrigenNota.JEFE_PRODUCCION.name(), notas.stream()
                .filter(nota -> nota.getOrigen() == OrigenNota.JEFE_PRODUCCION)
                .collect(Collectors.toList()));
        
        // Devolver notas filtradas por origen
        return notasAgrupadas;
    }

    // Endpoint: POST /api/ot-fases/{id}/notas
    // Consultar las notas en una fase de OT determinada.
    // Acceso: Jefe de producción y Operario asignado a la fase.
    public OtNotaResponseDTO generarNotaFase(Long otFaseId, OtNotaRequestDTO dto, String usuarioMail) {
        // Validar que la fase existe
        OtFase otFase = otFaseRepository.findById(otFaseId)
                .orElseThrow(() -> new EntityNotFoundException("La fase con ID " + otFaseId + " no existe"));

        // Validar que la OT existe
        OrdenTrabajo ordenTrabajo = ordenTrabajoRepository.findById(otFase.getOrdenTrabajo().getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "La orden de trabajo con ID " + otFase.getOrdenTrabajo().getId() + " no existe"));

        // Validar que el usuario existe
        Usuario usuario = usuarioRepository.findByEmail(usuarioMail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El usuario con email " + usuarioMail + " no existe"));

        // Crear la nota
        com.backend.qualititrack.modelos.OtNota nota = new com.backend.qualititrack.modelos.OtNota();
        nota.setOrdenTrabajo(ordenTrabajo);
        nota.setOtFase(otFase);
        nota.setUsuario(usuario);
        nota.setOrigen(usuario.getRol() == NivelRol.CALIDAD ? OrigenNota.CALIDAD : OrigenNota.JEFE_PRODUCCION);
        nota.setContenido(dto.getContenido());
        nota.setCreatedAt(OffsetDateTime.now());

        // Guardar la nota
        OtNota savedNota = otNotaRepository.save(nota);
        // Devolver la nota como DTO
        return convertirADTO(savedNota);
    }

    private OtNotaResponseDTO convertirADTO(com.backend.qualititrack.modelos.OtNota nota) {
        OtNotaResponseDTO dto = new OtNotaResponseDTO();
        dto.setId(nota.getId());
        dto.setOrdenTrabajoId(nota.getOrdenTrabajo().getId());
        dto.setOtFaseId(nota.getOtFase().getId());
        dto.setUsuarioId(nota.getUsuario().getId());
        dto.setOrigen(nota.getOrigen());
        dto.setContenido(nota.getContenido());
        dto.setCreatedAt(nota.getCreatedAt());
        return dto;
    }
}
