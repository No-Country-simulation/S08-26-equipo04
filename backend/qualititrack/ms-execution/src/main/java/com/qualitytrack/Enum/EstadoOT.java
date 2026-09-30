package com.qualitytrack.Enum;

public enum EstadoOT {
    EN_PRODUCCION, 
    EN_CALIDAD, 
    NO_CONFORME, 
    DESPACHO, 
    ENTREGADA,
    // Cancelada no se encuentra formalmente declarada, pero se deja porque se hizo un endpoint cancelar que lo utiliza.
    CANCELADA
}