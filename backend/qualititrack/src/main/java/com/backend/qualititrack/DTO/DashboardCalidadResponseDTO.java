package com.backend.qualititrack.DTO;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardCalidadResponseDTO {

    // Indicador 1: Porcentaje de OTs conformes vs no conformes
    private EstadisticasConformidadDTO conformidad;

    // Indicador 2: Cantidad de retrabajos hechos por fase
    private Map<String, Long> retrabajosPorFase;

    // Indicador 3: Listado de auditorías recientes
    private List<AuditoriaRecienteDTO> auditoriasRecientes;

    // Tiempo promedio general en calidad
    private double tiempoPromedioCalidadMinutos;

    @Getter
    @Setter
    public static class EstadisticasConformidadDTO {
        private long totalOtsEvaluadas;
        private long conformes;
        private long noConformes;
        private double porcentajeConformes;
    }

    @Getter
    @Setter
    public static class AuditoriaRecienteDTO {
        private Long idOt;
        private String numeroOt;
        private String resultado; // Ej: CONFORME, NO_CONFORME
        private String fechaAuditoria;
        private double tiempoEnCalidadMinutos;
    }
}