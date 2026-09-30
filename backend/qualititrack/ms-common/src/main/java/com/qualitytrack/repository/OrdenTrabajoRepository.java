package com.qualitytrack.repository;

import com.qualitytrack.Enum.EstadoOT;
import com.qualitytrack.modelos.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {

    Optional<OrdenTrabajo> findByCotizacionId(Long cotizacionId);

    // Para devolver pendientes de auditoría, con la más antigua primero
    List<OrdenTrabajo> findByEstadoOrderByFechaPaseCalidadAsc(EstadoOT estado);

    List<OrdenTrabajo> findByEstado(EstadoOT estado);
}
