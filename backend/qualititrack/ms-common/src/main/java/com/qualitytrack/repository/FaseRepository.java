package com.qualitytrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qualitytrack.modelos.FaseCatalogo;

@Repository
public interface FaseRepository extends JpaRepository<FaseCatalogo, Long> {
}