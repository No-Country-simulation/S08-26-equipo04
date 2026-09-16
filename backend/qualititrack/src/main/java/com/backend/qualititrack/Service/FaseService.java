package com.backend.qualititrack.Service;

import com.backend.qualititrack.modelos.Fase;
import com.backend.qualititrack.repository.FaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FaseService {

    @Autowired
    private FaseRepository faseRepository;

    public List<Fase> listarFases() {
        return faseRepository.findAll();
    }

    public Fase crearFase(Fase fase) {
        return faseRepository.save(fase);
    }

    // Actualizar campos de una fase existente
    public Fase actualizarFase(Long id, Fase detallesFase) {
        Fase fase = faseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada con ID: " + id));

        // Actualiza los campos necesarios según la entidad Fase
        fase.setNombre(detallesFase.getNombre());
        // Agrega aquí los demás campos que tenga la entidad Fase

        return faseRepository.save(fase);
    }

    // Habilitar o deshabilitar operarios sobre una fase específica
    public Fase gestionarHabilitacionOperario(Long faseId, Long operarioId, boolean habilitar) {
        Fase fase = faseRepository.findById(faseId)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada con ID: " + faseId));

        // Aquí se integra la lógica de relación entre la fase y el operario
        // actualizar una lista o tabla intermedia)

        return faseRepository.save(fase);
    }
}