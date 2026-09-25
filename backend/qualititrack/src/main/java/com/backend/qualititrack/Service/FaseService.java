package com.backend.qualititrack.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.FaseOperarioHabilitadoResponseDTO;
import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.modelos.FaseCatalogo;
import com.backend.qualititrack.modelos.FaseOperarioHabilitado;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.FaseOperarioHabilitadoRepository;
import com.backend.qualititrack.repository.FaseRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class FaseService {

    @Autowired
    private FaseRepository faseRepository;

    @Autowired 
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FaseOperarioHabilitadoRepository faseOperarioRepository;

    public List<FaseCatalogo> listarFases() {
        return faseRepository.findAll();
    }

    public FaseCatalogo crearFase(FaseCatalogo fase) {
        return faseRepository.save(fase);
    }

    // Actualizar campos de una fase existente
    public FaseCatalogo actualizarFase(Long id, FaseCatalogo detallesFase) {
        FaseCatalogo fase = faseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada con ID: " + id));

        // Actualiza los campos necesarios según la entidad Fase
        fase.setNombre(detallesFase.getNombre());
        // Agrega aquí los demás campos que tenga la entidad Fase

        return faseRepository.save(fase);
    }

    /**
     * POST /api/fases/{id}/habilitar
     * Habilita o deshabilita operarios sobre una fase específica
     */
    @Transactional
    public FaseOperarioHabilitadoResponseDTO gestionarHabilitacionOperario(Long faseId, Long operarioId, Boolean habilitar, String emailGerenteAutenticado) {
        // Validar fase
        FaseCatalogo fase = faseRepository.findById(faseId)
                .orElseThrow(() -> new EntityNotFoundException("Fase no encontrada con ID: " + faseId));
        
        // Validar usuario y su rol
        Usuario usuario = usuarioRepository.findById(operarioId)
            .orElseThrow(() -> new EntityNotFoundException("Operario no encontrado con ID: " + operarioId));
        if (usuario.getRol() != NivelRol.OPERARIO) {
            throw new AccessDeniedException("El usuario no es un operario");
        }
        
        // Obtener id del gerente que hace la solicitud
        Usuario gerente = usuarioRepository.findByEmail(emailGerenteAutenticado)
            .orElseThrow(() -> new IllegalArgumentException("Gerente autenticado no encontrado en la base de datos"));
        
        // 4. Buscar si la relación ya existe
        java.util.Optional<FaseOperarioHabilitado> existente = faseOperarioRepository.findByFaseCatalogoIdAndOperarioId(faseId, operarioId);

        // Generar o actualizar relacion
        FaseOperarioHabilitado relacion;
        if (existente.isPresent()) {
            relacion = existente.get();
            relacion.setHabilitado(habilitar);
            relacion.setAsignadoPor(gerente);
        } else {
            // Si no existe, creamos el nuevo registro
            relacion = FaseOperarioHabilitado.builder()
                    .faseCatalogo(fase)
                    .operario(usuario)
                    .habilitado(habilitar)
                    .asignadoPor(gerente)
                    .createdAt(java.time.OffsetDateTime.now())
                    .build();
        }

        FaseOperarioHabilitado saved = faseOperarioRepository.save(relacion);
        
        return convertirADTO(saved);
    }

    private FaseOperarioHabilitadoResponseDTO convertirADTO(FaseOperarioHabilitado faseOperacion) {
        FaseOperarioHabilitadoResponseDTO dto = new FaseOperarioHabilitadoResponseDTO();
        dto.setId(faseOperacion.getId());
        dto.setFaseCatalogoId(faseOperacion.getFaseCatalogo().getId());
        dto.setOperarioId(faseOperacion.getOperario().getId());
        dto.setHabilitado(faseOperacion.getHabilitado());
        dto.setAsignadoPorId(faseOperacion.getAsignadoPor().getId());
        dto.setNombreOperario(faseOperacion.getOperario().getNombre());
        dto.setCreatedAt(faseOperacion.getCreatedAt());
        return dto;
    }
}