package com.qualitytrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.qualitytrack.Enum.EstadoOtFase;
import com.qualitytrack.modelos.OtFase;

public interface OtFaseRepository extends JpaRepository<OtFase, Long> {
        // Trae en una sola consulta todo lo que usa convertirADTO (OT, cotización,
        // solicitud y fase)
        @Query("SELECT f FROM OtFase f " + "JOIN FETCH f.ordenTrabajo ot " + "JOIN FETCH ot.cotizacion c "
                        + "JOIN FETCH c.solicitud " + "JOIN FETCH f.faseCatalogo")
        List<OtFase> findAllWithRelaciones();

        @Query("SELECT f FROM OtFase f " +
                        "JOIN FETCH f.ordenTrabajo ot " +
                        "JOIN FETCH ot.cotizacion c " +
                        "JOIN FETCH c.solicitud " +
                        "JOIN FETCH f.faseCatalogo " +
                        "WHERE ot.id = :ordenTrabajoId " +
                        "ORDER BY f.cicloIteracion, f.numeroSecuencia")
        List<OtFase> findByOrdenTrabajoIdWithRelaciones(@Param("ordenTrabajoId") Long ordenTrabajoId);

        @Query("SELECT f FROM OtFase f " + "JOIN FETCH f.ordenTrabajo ot " + "JOIN FETCH ot.cotizacion c "
                        + "JOIN FETCH c.solicitud " + "JOIN FETCH f.faseCatalogo "
                        + "WHERE f.operario.id = :operarioId")
        List<OtFase> findByOperario_Id(@Param("operarioId") Long operarioId);

        OtFase findByOrdenTrabajoIdAndNumeroSecuencia(Long ordenTrabajoId, Integer numeroSecuencia);

        List<OtFase> findByOrdenTrabajoId(Long ordenTrabajoId);

        OtFase findByOrdenTrabajoIdAndNumeroSecuenciaAndCicloIteracion(Long otId, Integer numeroSecuencia,
                        Integer cicloIteracion);

        // Obtiene la última iteración registrada de una secuencia puntual para esa OT
        Optional<OtFase> findFirstByOrdenTrabajoIdAndNumeroSecuenciaOrderByCicloIteracionDesc(
                        Long ordenTrabajoId,
                        Integer numeroSecuencia);

        // Consulta de precedencia: busca si existen fases previas que NO estén en el
        // estado TERMINADO
        boolean existsByOrdenTrabajoIdAndCicloIteracionAndNumeroSecuenciaLessThanAndEstadoNot(
                        Long ordenTrabajoId,
                        Integer cicloIteracion,
                        Integer numeroSecuencia,
                        EstadoOtFase estado);

        // Busca la siguiente, aunque no sea consecutiva (por cuestiones de retrabajo)

        @Query("SELECT o FROM OtFase o WHERE o.ordenTrabajo.id = :ordenTrabajoId AND o.numeroSecuencia > :numeroSecuencia AND o.estado != 'TERMINADO' ORDER BY o.numeroSecuencia ASC, o.cicloIteracion DESC LIMIT 1")
        Optional<OtFase> findNextFase(@Param("ordenTrabajoId") Long ordenTrabajoId,
                        @Param("numeroSecuencia") Integer numeroSecuencia);
}