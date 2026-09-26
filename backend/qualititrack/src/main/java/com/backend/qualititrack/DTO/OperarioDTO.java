package com.backend.qualititrack.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String tipoTarea;
    private Boolean activo;
}