package com.qualitytrack.repository;

import com.qualitytrack.modelos.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {
    Optional<OrdenTrabajo> findByCotizacionId(Long cotizacionId);

    /**
     * Listar órdenes de trabajo por estado
     */
    List<OrdenTrabajo> findByEstado(String estado);

    /**
     * Listar órdenes de trabajo por cliente
     */
    List<OrdenTrabajo> findByClienteId(Long clienteId);
}
