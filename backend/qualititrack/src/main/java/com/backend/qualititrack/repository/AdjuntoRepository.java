
package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.modelos.Adjunto;
import com.backend.qualititrack.modelos.Solicitud;

@Repository
public interface AdjuntoRepository extends JpaRepository<Adjunto, Long> {

    List<Adjunto> findBySolicitudOrderByCreatedAtDesc(Solicitud solicitud);
}
