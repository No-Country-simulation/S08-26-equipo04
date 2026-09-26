package com.backend.qualititrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.FaseCatalogo;
import com.backend.qualititrack.modelos.FaseOperarioHabilitado;
import com.backend.qualititrack.modelos.Usuario;

@Repository
public interface FaseOperarioHabilitadoRepository extends JpaRepository<FaseOperarioHabilitado, Long> {

    // Para ver si ya hay una entrada generada.
    Optional<FaseOperarioHabilitado> findByFaseCatalogoIdAndOperarioId(Long faseId, Long operarioId);

    // Utilizado para buscar si un operario ya se encuentra habilitado en una fase
    // específica
    boolean existsByFaseCatalogoIdAndOperarioIdAndHabilitadoTrue(Long faseId, Long operarioId);

    // Utilizado para buscar operarios habilitados para una fase específica
    @Query("SELECT foh.operario FROM FaseOperarioHabilitado foh " +
            "WHERE foh.faseCatalogo.id = :fase_id " +
            "AND foh.habilitado = true " +
            "AND foh.operario.activo = true")
    List<Usuario> findOperariosHabilitadosByFaseId(@Param("fase_id") Long faseId);

    // Trae fases con al menos un operario habilitado
    @Query("select distinct h.faseCatalogo from FaseOperarioHabilitado h " +
            "where h.habilitado = true and h.faseCatalogo.activo = true")
    List<FaseCatalogo> findFasesActivasConOperarios();
}