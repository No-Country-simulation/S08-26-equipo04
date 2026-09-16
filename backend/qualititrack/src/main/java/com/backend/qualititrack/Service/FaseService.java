package com.backend.qualititrack.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.modelos.FaseCatalogo;
import com.backend.qualititrack.modelos.FaseOperarioHabilitado;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.FaseOperarioHabilitadoRepository;
import com.backend.qualititrack.repository.FaseRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

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

    // Habilitar o deshabilitar operarios sobre una fase específica
    public FaseOperarioHabilitado gestionarHabilitacionOperario(Long faseId, Long operarioId, boolean habilitar, String emailGerenteAutenticado) {
        // Validar fase
        FaseCatalogo fase = faseRepository.findById(faseId)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada con ID: " + faseId));
        
        // Validar usuario y su rol
        Usuario usuario = usuarioRepository.findById(operarioId)
            .orElseThrow(() -> new RuntimeException("Operario no encontrado con ID: " + operarioId));
        if (usuario.getRol() != NivelRol.OPERARIO) {
            throw new RuntimeException("El usuario no es un operario");
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

        return faseOperarioRepository.save(relacion);
    }
}