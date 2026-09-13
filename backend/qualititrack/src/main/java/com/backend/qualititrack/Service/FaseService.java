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
}