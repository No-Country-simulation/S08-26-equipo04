package com.backend.qualititrack.DTO;

import java.util.List;

import com.backend.qualititrack.Enum.ResultadoCalidad;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class CalidadConformidadDTO {
    @NotEmpty(message = "Debe enviar exactamente 7 respuestas")
    @Size(min = 7, max = 7, message = "El checklist debe tener las 7 respuestas")
    @Valid
    private List<RespuestaChecklistItemDTO> respuestas;

    private ResultadoCalidad resultado; // CONFORME o NO_CONFORME

    private String observacionesGenerales;

}

