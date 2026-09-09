package com.backend.qualititrack.Enum;

public enum EstadoSolicitud {
    CREADA,          // Solicitud recién creada por vendedor
    ACEPTADA,        // Jefe de producción la aceptó
    COTIZADA,        // Cotización generada y enviada a cliente
    PRODUCCIÓN,      // Orden de trabajo en ejecución
    CALIDAD,         // Pasó a inspección de calidad
    COMPLETADA,      // OT completada y conforme
    RECHAZADA,       // Cliente rechazó la cotización
    CANCELADA        // Solicitud cancelada
}
