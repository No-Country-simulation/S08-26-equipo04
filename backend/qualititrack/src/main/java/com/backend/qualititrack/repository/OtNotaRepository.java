package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.qualititrack.modelos.OtNota;

public interface OtNotaRepository extends JpaRepository<OtNota, Long> {
    
    List<OtNota> findByOtFaseId(Long otFaseId);
}
