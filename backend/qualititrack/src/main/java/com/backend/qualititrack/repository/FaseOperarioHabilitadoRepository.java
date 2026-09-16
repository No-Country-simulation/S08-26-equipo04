package com.backend.qualititrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.FaseOperarioHabilitado;

@Repository
public interface FaseOperarioHabilitadoRepository extends JpaRepository<FaseOperarioHabilitado, Long> {
    Optional<FaseOperarioHabilitado> findByFaseCatalogoIdAndOperarioId(Long faseId, Long operarioId);
}