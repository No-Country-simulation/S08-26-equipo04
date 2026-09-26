package com.qualitytrack.repository;

import com.qualitytrack.modelos.AuditoriaCalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaCalidadRepository extends JpaRepository<AuditoriaCalidad, Long> {
}
