package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.qualititrack.modelos.CotizacionFase;

public interface CotizacionFaseRepository extends JpaRepository<CotizacionFase, Long>{
    List<CotizacionFase> findByCotizacionIdOrderByNumeroSecuenciaAsc(Long cotizacionId);
}
