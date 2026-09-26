package com.qualitytrack.DTO;

import com.qualitytrack.Enum.EstadoSolicitud;

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
    private String numeroSolicitud;
    private EstadoSolicitud estado;
}