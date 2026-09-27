package com.backend.qualititrack.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardPlantaDTO {

    // Cantidad de OTs pendientes y activas en la planta
    private long cantidadPendientes;
    private long cantidadActivas;

    // Desglose de OTs por fase existente (ej: "Fase 1: 5", "Fase 2: 12")
    private Map<String, Long> fasesExistentes;

    // Identificación o descripción del cuello de botella detectado en planta
    private String cuelloDeBotella;
}