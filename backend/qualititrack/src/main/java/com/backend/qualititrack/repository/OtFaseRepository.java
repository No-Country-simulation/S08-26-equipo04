package com.backend.qualititrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.qualititrack.Enum.EstadoOtFase;
import com.backend.qualititrack.modelos.OtFase;

public interface OtFaseRepository extends JpaRepository<OtFase, Long> {
        @Query("SELECT f FROM OtFase f " + "JOIN FETCH f.ordenTrabajo " + "JOIN FETCH f.faseCatalogo")
        List<OtFase> findAllWithRelaciones();
        
        List<OtFase> findByOperario_Id(Long operarioId);

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
}
