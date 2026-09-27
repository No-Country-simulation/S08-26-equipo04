package com.backend.qualititrack.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.qualititrack.DTO.DashboardCalidadResponseDTO;
import com.backend.qualititrack.DTO.DashboardPlantaDTO;
import com.backend.qualititrack.modelos.AuditoriaCalidad;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.OtFase;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.OtFaseRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private OtFaseRepository otFaseRepository;

    @Transactional(readOnly = true)
    public DashboardCalidadResponseDTO obtenerMetricasCalidad() {
        DashboardCalidadResponseDTO response = new DashboardCalidadResponseDTO();

        // 1. Indicador de Conformidad
        List<OrdenTrabajo> ordenes = ordenTrabajoRepository.findAll();

        List<AuditoriaCalidad> auditorias = ordenes.stream()
                .map(OrdenTrabajo::getCalidadChecklist)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        long totalEvaluadas = auditorias.size();

        // Comparación correcta usando el enum interno AuditoriaCalidad.Resultado
        long conformes = auditorias.stream()
                .filter(a -> a.getResultado() == AuditoriaCalidad.Resultado.CONFORME)
                .count();

        long noConformes = totalEvaluadas - conformes;
        double porcentajeConformes = totalEvaluadas > 0 ? ((double) conformes / totalEvaluadas) * 100.0 : 0.0;

        DashboardCalidadResponseDTO.EstadisticasConformidadDTO conformidadDTO = new DashboardCalidadResponseDTO.EstadisticasConformidadDTO();
        conformidadDTO.setTotalOtsEvaluadas(totalEvaluadas);
        conformidadDTO.setConformes(conformes);
        conformidadDTO.setNoConformes(noConformes);
        conformidadDTO.setPorcentajeConformes(porcentajeConformes);
        response.setConformidad(conformidadDTO);

        // 2. Retrabajos por fase
        List<OtFase> fases = otFaseRepository.findAll();
        Map<String, Long> retrabajosPorFase = new HashMap<>();

        for (OtFase fase : fases) {
            String nombreFase = "Fase General";
            retrabajosPorFase.put(nombreFase, retrabajosPorFase.getOrDefault(nombreFase, 0L) + 1L);
        }
        response.setRetrabajosPorFase(retrabajosPorFase);

        // 3. Auditorías recientes
        List<DashboardCalidadResponseDTO.AuditoriaRecienteDTO> auditoriasRecientes = auditorias.stream()
                .limit(10)
                .map(a -> {
                    DashboardCalidadResponseDTO.AuditoriaRecienteDTO dto = new DashboardCalidadResponseDTO.AuditoriaRecienteDTO();
                    if (a.getOrdenTrabajo() != null) {
                        dto.setIdOt(a.getOrdenTrabajo().getId());
                        dto.setNumeroOt(a.getOrdenTrabajo().getNumeroOt());
                    }
                    dto.setResultado(a.getResultado() != null ? a.getResultado().name() : "PENDIENTE");
                    dto.setFechaAuditoria(a.getFechaVeredicto() != null ? a.getFechaVeredicto().toString() : "");
                    dto.setTiempoEnCalidadMinutos(0.0);
                    return dto;
                })
                .collect(Collectors.toList());

        response.setAuditoriasRecientes(auditoriasRecientes);
        response.setTiempoPromedioCalidadMinutos(0.0);

        return response;
    }

    /**
     * MÉTRICAS DE PLANTA - Dashboard Global para el Gerente (HU-5.3)
     */
    @Transactional(readOnly = true)
    public DashboardPlantaDTO obtenerMetricasPlanta() {
        List<OrdenTrabajo> todasLasOt = ordenTrabajoRepository.findAll();

        // 1. Contar OTs pendientes y activas
        long pendientes = todasLasOt.stream()
                .filter(ot -> ot.getEstado() != null && ot.getEstado().name().equals("PENDIENTE"))
                .count();

        // Consideramos activas las que están en proceso de producción o en fases (ajusta según tus estados)
        long activas = todasLasOt.stream()
                .filter(ot -> ot.getEstado() != null && !ot.getEstado().name().equals("PENDIENTE") 
                            && !ot.getEstado().name().equals("ENTREGADA") 
                            && !ot.getEstado().name().equals("CANCELADA"))
                .count();

        // 2. Agrupar por fases existentes y contar volumen
        List<OtFase> fases = otFaseRepository.findAll();
        Map<String, Long> fasesExistentes = new HashMap<>();

        for (OtFase fase : fases) {
            String nombreFase = (fase.getFaseCatalogo() != null && fase.getFaseCatalogo().getNombre() != null)
                    ? fase.getFaseCatalogo().getNombre()
                    : "Fase General";
            fasesExistentes.put(nombreFase, fasesExistentes.getOrDefault(nombreFase, 0L) + 1L);
        }

        // 3. Detectar cuello de botella (la fase con más OTs o elementos acumulados)
        String cuelloDeBotella = fasesExistentes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> "Fase con mayor acumulación: " + entry.getKey() + " (" + entry.getValue() + " elementos)")
                .orElse("No se registran acumulaciones críticas");

        return new DashboardPlantaDTO(pendientes, activas, fasesExistentes, cuelloDeBotella);
    }

}