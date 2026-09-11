package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.Enum.EstadoSolicitud;
import com.backend.qualititrack.modelos.Solicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud,Long> {

    List<Solicitud> findByEstado(EstadoSolicitud estado);
}
