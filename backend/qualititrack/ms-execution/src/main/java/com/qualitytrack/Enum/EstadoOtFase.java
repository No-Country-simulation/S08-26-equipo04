package com.qualitytrack.Enum;

public enum EstadoOtFase {
    EN_COLA("En Cola"),
    EN_EJECUCION("En Ejecución"),
    TERMINADO("Terminado");

    private final String descripcion;

    EstadoOtFase(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
