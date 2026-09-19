package com.backend.qualititrack.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntregaOtRequestDTO {

    @NotBlank(message = "El nombre del receptor es obligatorio")
    private String receptorNombre;
}