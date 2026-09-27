package com.backend.qualititrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.AuditoriaChecklistRespuesta;

@Repository
public interface AuditoriaChecklistRespuestaRepository
        extends JpaRepository<AuditoriaChecklistRespuesta, Long> {

    Optional<AuditoriaChecklistRespuesta> findByAuditoriaIdAndItemNumero(
            Long auditoriaId,
            Integer itemNumero
    );
}