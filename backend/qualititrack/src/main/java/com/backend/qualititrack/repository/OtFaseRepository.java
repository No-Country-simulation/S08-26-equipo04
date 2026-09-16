package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.qualititrack.modelos.OtFase;

public interface OtFaseRepository extends JpaRepository<OtFase, Long> {
    List<OtFase> findByOperario_Id(Long operarioId);
    OtFase findByOrdenTrabajoIdAndNumeroSecuencia(Long ordenTrabajoId, Integer numeroSecuencia);
}
