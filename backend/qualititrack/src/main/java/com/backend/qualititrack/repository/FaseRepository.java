package com.backend.qualititrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.FaseCatalogo;

@Repository
public interface FaseRepository extends JpaRepository<FaseCatalogo, Long> {
}