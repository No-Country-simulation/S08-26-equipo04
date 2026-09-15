package com.backend.qualititrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.qualititrack.modelos.OrdenTrabajo;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {
    
}
