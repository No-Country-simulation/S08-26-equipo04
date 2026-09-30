package com.qualitytrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qualitytrack.Enum.EstadoSolicitud;
import com.qualitytrack.modelos.Solicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud,Long> {

    List<Solicitud> findByEstado(EstadoSolicitud estado);
    List<Solicitud> findByVendedorEmail(String email);
}
