package com.qualitytrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qualitytrack.modelos.CotizacionFase;

public interface CotizacionFaseRepository extends JpaRepository<CotizacionFase, Long>{
    List<CotizacionFase> findByCotizacionIdOrderByNumeroSecuenciaAsc(Long cotizacionId);
}
