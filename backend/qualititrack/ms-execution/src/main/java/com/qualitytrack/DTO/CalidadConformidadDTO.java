package com.qualitytrack.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalidadConformidadDTO {
    @NotEmpty(message = "Debe enviar exactamente 7 respuestas")
    @Valid
    private List<RespuestaChecklistItemDTO> respuestas;

    @NotNull(message = "El resultado no puede ser nulo")
    private String resultado; // CONFORME o NO_CONFORME

    private String observacionesGenerales;

    public List<RespuestaChecklistItemDTO> getRespuestas() {
        return respuestas;
    }

    public void setRespuestas(List<RespuestaChecklistItemDTO> respuestas) {
        this.respuestas = respuestas;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservacionesGenerales() {
        return observacionesGenerales;
    }

    public void setObservacionesGenerales(String observacionesGenerales) {
        this.observacionesGenerales = observacionesGenerales;
    }
}

