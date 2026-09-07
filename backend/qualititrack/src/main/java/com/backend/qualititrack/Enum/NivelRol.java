package com.backend.qualititrack.Enum;

public enum NivelRol {
    VENDEDOR,           // Nivel 1: Carga solicitudes, confirma entregas
    JEFE_PRODUCCION,    // Nivel 2: Arma cotizaciones, asigna operarios, inicia OTs
    OPERARIO,           // Nivel 2: Ejecuta fases asignadas
    CALIDAD,            // Nivel 3: Verifica OTs completadas
    GERENTE             // Nivel 4: Configura catálogo, ve indicadores, supervisión general
}
