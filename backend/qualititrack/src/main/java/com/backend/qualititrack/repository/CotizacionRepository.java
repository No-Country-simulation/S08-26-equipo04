package com.backend.qualititrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.Enum.EstadoCotizacion;
import com.backend.qualititrack.modelos.Cotizacion;

@Repository
public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {
    Optional<Cotizacion> findBySolicitudId(Long solcitudId);
    List<Cotizacion> findByEstado(EstadoCotizacion estado);

    // Consulta que trae las cotizaciones y los detalles asociados
    @Query("SELECT DISTINCT c FROM Cotizacion c " +
           "JOIN FETCH c.solicitud s " +
           "JOIN FETCH s.cliente cl " +
           "JOIN FETCH c.jefeProduccion j " +
           "LEFT JOIN FETCH c.fases f " +
           "LEFT JOIN FETCH f.faseCatalogo fc")
    List<Cotizacion> findAllWithDetails();
}
