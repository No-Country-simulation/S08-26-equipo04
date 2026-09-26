package com.qualitytrack.Enum;

public enum EstadoOT {
    CREADA("Creada"),
    PENDIENTE("Pendiente"),
    EN_PROGRESO("En Progreso"),
    COMPLETADA("Completada"),
    CANCELADA("Cancelada"),
    CALIDAD ("Calidad");

    private final String descripcion;

    EstadoOT(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
}}

