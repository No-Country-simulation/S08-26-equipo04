package com.qualitytrack.repository;

import com.qualitytrack.modelos.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudRepositorio extends JpaRepository<Solicitud, Long> {
    /**
     * Buscar solicitud por número de solicitud
     */
    Optional<Solicitud> findByNumeroSolicitud(String numeroSolicitud);

    /**
     * Listar solicitudes por estado
     */
    List<Solicitud> findByEstado(String estado);

    /**
     * Listar solicitudes por cliente
     */
    List<Solicitud> findByClienteId(Long clienteId);

    /**
     * Listar solicitudes por vendedor
     */
    List<Solicitud> findByVendedorId(Long vendedorId);
}
