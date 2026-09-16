package com.backend.qualititrack.Enum;

public enum EstadoOT {
    EN_PRODUCCION, 
    EN_CALIDAD, 
    NO_CONFORME, 
    DESPACHO, 
    ENTREGADA,
    // Las categorias debajo provienen de lo planteado por Abel. Las no comentadas se dejan así porque se utilizan en el código. Habría que plantear el equivalente adecuado con las de la documentación, o agregarlas formalmente si se consideran estados necesarios.
    CREADA,
    // INICIADA,
    // EN_PROGRESO,
    PENDIENTE,
    COMPLETADA,
    // CALIDAD,
    // APROBADA,
    // RECHAZADA,
    CANCELADA
}