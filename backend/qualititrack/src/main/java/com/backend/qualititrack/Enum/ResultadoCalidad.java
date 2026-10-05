package com.backend.qualititrack.Enum;

public enum ResultadoCalidad {
    /**
     * Resultado posible de una inspección de CALIDAD_CHECKLIST.
     *
     * Si todos los 7-8 puntos son conformes → CONFORME
     * Si al menos uno falla → NO_CONFORME
     */
    CONFORME,       // Todos los puntos pasaron
    NO_CONFORME     // Al menos un punto falló
}
