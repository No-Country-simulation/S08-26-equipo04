package com.backend.qualititrack.Service;

import com.backend.qualititrack.modelos.Fase;
import com.backend.qualititrack.modelos.FaseCatalogo;
import com.backend.qualititrack.repository.FaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FaseService {

    @Autowired
    private FaseRepository faseRepository;

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
    public FaseCatalogo gestionarHabilitacionOperario(Long faseId, Long operarioId, boolean habilitar) {
        FaseCatalogo fase = faseRepository.findById(faseId)
                .orElseThrow(() -> new RuntimeException("Fase no encontrada con ID: " + faseId));

        // Aquí se integra la lógica de relación entre la fase y el operario
        // actualizar una lista o tabla intermedia)

        return faseRepository.save(fase);
    }
}