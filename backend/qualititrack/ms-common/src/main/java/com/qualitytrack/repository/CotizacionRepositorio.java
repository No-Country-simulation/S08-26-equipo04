package com.qualitytrack.repository;

import com.qualitytrack.modelos.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CotizacionRepositorio extends JpaRepository<Cotizacion , Long> {
    Optional<Cotizacion> findBySolicitudId(Long solcitudId);
    List<Cotizacion> findByEstado(String estado);
}
