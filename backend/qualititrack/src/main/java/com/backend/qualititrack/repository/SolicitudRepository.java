package com.backend.qualititrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.Solicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud,Long> {

}
