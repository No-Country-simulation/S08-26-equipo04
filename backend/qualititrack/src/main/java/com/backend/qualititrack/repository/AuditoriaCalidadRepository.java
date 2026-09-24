package com.backend.qualititrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.AuditoriaCalidad;

@Repository
public interface AuditoriaCalidadRepository extends JpaRepository<AuditoriaCalidad, Long> {

    Optional<AuditoriaCalidad> findFirstByOrdenTrabajoIdOrderByNumeroAuditoriaDesc(Long ordenTrabajoId);
}