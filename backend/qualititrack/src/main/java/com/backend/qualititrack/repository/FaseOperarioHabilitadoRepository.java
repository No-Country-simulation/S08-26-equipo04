package com.backend.qualititrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.FaseOperarioHabilitado;

@Repository
public interface FaseOperarioHabilitadoRepository extends JpaRepository<FaseOperarioHabilitado, Long> {
    
    // Para ver si ya hay una entrada generada.
    Optional<FaseOperarioHabilitado> findByFaseCatalogoIdAndOperarioId(Long faseId, Long operarioId);

    // Utilizado para buscar si un operario ya se encuentra habilitado en una fase específica
    Optional<FaseOperarioHabilitado> findByFaseCatalogoIdAndOperarioIdAndHabilitadoTrue(Long faseId, Long operarioId);

    // Utilizado para buscar operarios habilitados para una fase específica
    List<FaseOperarioHabilitado> findByFaseCatalogoIdAndHabilitadoTrue(Long faseCatalogoId);
}