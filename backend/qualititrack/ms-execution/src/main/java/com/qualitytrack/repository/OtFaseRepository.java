package com.qualitytrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qualitytrack.modelos.OtFase;

public interface OtFaseRepository extends JpaRepository<OtFase, Long> {
    List<OtFase> findByOperario_Id(Long operarioId);

    OtFase findByOrdenTrabajoIdAndNumeroSecuencia(Long ordenTrabajoId, int numeroSecuencia);

    List<OtFase> findByOrdenTrabajoId(Long ordenTrabajoId);

    List<OtFase> findByEstado(String estado);
}