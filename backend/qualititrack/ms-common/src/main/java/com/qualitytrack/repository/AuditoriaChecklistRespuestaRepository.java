package com.qualitytrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qualitytrack.modelos.AuditoriaChecklistRespuesta;

@Repository
public interface AuditoriaChecklistRespuestaRepository extends JpaRepository<AuditoriaChecklistRespuesta, Long> {
    List<AuditoriaChecklistRespuesta> findByAuditoriaIdOrderByItemNumero(Long auditoriaId);
    Optional<AuditoriaChecklistRespuesta> findByAuditoriaIdAndItemNumero(
        Long auditoriaId,
        Integer itemNumero);
}