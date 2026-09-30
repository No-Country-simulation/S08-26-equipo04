package com.qualitytrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qualitytrack.modelos.OtFaseReasignacion;

public interface OtFaseReasignacionRepository extends JpaRepository<OtFaseReasignacion, Long> {
    // Reasignaciones de todas las fases de una OT, de la más vieja a la más nueva
    List<OtFaseReasignacion> findByOtFase_OrdenTrabajo_IdOrderByFechaReasignacionAsc(Long ordenTrabajoId);
}
