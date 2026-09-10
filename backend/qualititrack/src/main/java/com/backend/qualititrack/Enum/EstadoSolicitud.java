package com.backend.qualititrack.Enum;

// Enum que registra los posibles estados de una solicitud. Solo registra si fue cotizada o no; el ciclo comercial vive en la cotización
public enum EstadoSolicitud {
    PENDIENTE_COTIZACION,   // Solicitud creada por vendedor a la espera de una cotización
    COTIZADA,               // Cotización generada y enviada a cliente
}
