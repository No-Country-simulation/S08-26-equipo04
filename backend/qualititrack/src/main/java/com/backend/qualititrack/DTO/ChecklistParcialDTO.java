package com.backend.qualititrack.DTO;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistParcialDTO {

    @NotNull(message = "Las respuestas no pueden ser nulas")
    @Size(min = 1, max = 7, message = "Debe enviar entre 1 y 7 respuestas")
    @Valid
    private List<RespuestaDTO> respuestas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaDTO {

        @NotNull(message = "El número de ítem es obligatorio")
        @Min(value = 1, message = "El ítem debe estar entre 1 y 7")
        @Max(value = 7, message = "El ítem debe estar entre 1 y 7")
        private Integer itemNumero;

        // null significa "Pendiente"
        private ResultadoItem resultadoItem;

        private String observaciones;
    }

    public enum ResultadoItem {
        CUMPLE,
        NO_CUMPLE,
        NO_APLICA
    }
}