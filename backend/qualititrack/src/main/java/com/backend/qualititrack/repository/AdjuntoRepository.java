
package com.backend.qualititrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.qualititrack.DTO.AdjuntoResponseDTO;
import com.backend.qualititrack.modelos.Adjunto;
import com.backend.qualititrack.modelos.Solicitud;

@Repository
public interface AdjuntoRepository extends JpaRepository<Adjunto, Long> {

    List<Adjunto> findBySolicitudOrderByCreatedAtDesc(Solicitud solicitud);

    // Lista los archivos adjuntos para una solicitud sin traer el contenido de cada uno.
    @Query("select new com.backend.qualititrack.DTO.AdjuntoResponseDTO(" +
            "a.id, a.solicitud.id, a.nombreOriginal, a.tipoArchivo, a.mimeType, " +
            "a.tamanioBytes, a.rutaAlmacenamiento, a.subidoPor.id, a.createdAt) " +
            "from Adjunto a where a.solicitud.id = :solicitudId order by a.createdAt desc")
    List<AdjuntoResponseDTO> listarSinContenido(@Param("solicitudId") Long solicitudId);
}
