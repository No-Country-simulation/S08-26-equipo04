package com.qualitytrack.Enum;

public enum EstadoSolicitud {
    CREADA("Creada"),
    PENDIENTE_COTIZACION("Pendiente de Cotización"),
    APROBADA("Aprobada"),
    RECHAZADA("Rechazada");

    private final String descripcion;

    EstadoSolicitud(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
