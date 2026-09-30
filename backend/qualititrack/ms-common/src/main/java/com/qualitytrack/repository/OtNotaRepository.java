package com.qualitytrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qualitytrack.modelos.OtNota;

public interface OtNotaRepository extends JpaRepository<OtNota, Long> {
    
    List<OtNota> findByOtFaseId(Long otFaseId);
}
