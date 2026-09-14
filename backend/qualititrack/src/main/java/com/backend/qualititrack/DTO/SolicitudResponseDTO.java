package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.EstadoSolicitud;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudResponseDTO {

    private Long id;
    private String numero_solicitud;
    private EstadoSolicitud estado;
}