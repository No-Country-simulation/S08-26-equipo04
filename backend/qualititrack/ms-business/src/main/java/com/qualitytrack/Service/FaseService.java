package com.qualitytrack.Service;

import com.qualitytrack.modelos.FaseCatalogo;
import com.qualitytrack.repository.FaseRepository;
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
}