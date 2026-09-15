package com.backend.qualititrack.repository;

import com.backend.qualititrack.modelos.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRepositorio extends JpaRepository<Solicitud, Long> {
}
