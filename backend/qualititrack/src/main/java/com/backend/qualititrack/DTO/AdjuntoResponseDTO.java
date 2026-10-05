package com.backend.qualititrack.DTO;

import java.time.OffsetDateTime;

import com.backend.qualititrack.modelos.Adjunto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdjuntoResponseDTO {

    private Long id;
    private Long solicitudId;
    private String nombreOriginal;
    private Adjunto.TipoArchivo tipoArchivo;
    private String mimeType;
    private Long tamanioBytes;
    private String rutaAlmacenamiento;
    private Long subidoPorId;
    private OffsetDateTime createdAt;
}