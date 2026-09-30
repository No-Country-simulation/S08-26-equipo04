package com.qualitytrack.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qualitytrack.DTO.DashboardCalidadResponseDTO;
import com.qualitytrack.DTO.DashboardPlantaDTO;
import com.qualitytrack.Enum.EstadoOT;
import com.qualitytrack.Enum.EstadoOtFase;
import com.qualitytrack.Enum.ResultadoCalidad;
import com.qualitytrack.modelos.AuditoriaCalidad;
import com.qualitytrack.modelos.OrdenTrabajo;
import com.qualitytrack.modelos.OtFase;
import com.qualitytrack.repository.FaseRepository;
import com.qualitytrack.repository.OrdenTrabajoRepository;
import com.qualitytrack.repository.OtFaseRepository;

@Service
public class DashboardService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final OtFaseRepository otFaseRepository;
    private final FaseRepository faseRepository;

    public DashboardService(OrdenTrabajoRepository ordenTrabajoRepository, OtFaseRepository otFaseRepository, FaseRepository faseRepository) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.otFaseRepository = otFaseRepository;
        this.faseRepository = faseRepository;
    }

    @Transactional(readOnly = true)
    public DashboardCalidadResponseDTO obtenerMetricasCalidad() {
        DashboardCalidadResponseDTO response = new DashboardCalidadResponseDTO();

        // 1. Indicador de conformidad
        List<AuditoriaCalidad> auditorias = ordenTrabajoRepository.findAll().stream()
            .flatMap(ot -> ot.getAuditorias() == null
                ? Stream.<AuditoriaCalidad>empty()
                : ot.getAuditorias().stream())
            .collect(Collectors.toList());

        long totalEvaluadas = auditorias.size();
        long conformes = auditorias.stream()
            .filter(a -> a.getResultado() == ResultadoCalidad.CONFORME)
            .count();
        long noConformes = totalEvaluadas - conformes;
        double porcentajeConformes = totalEvaluadas > 0 ? ((double) conformes / totalEvaluadas) * 100.0 : 0.0;

        DashboardCalidadResponseDTO.EstadisticasConformidadDTO conformidadDTO = new DashboardCalidadResponseDTO.EstadisticasConformidadDTO();
        conformidadDTO.setTotalOtsEvaluadas(totalEvaluadas);
        conformidadDTO.setConformes(conformes);
        conformidadDTO.setNoConformes(noConformes);
        conformidadDTO.setPorcentajeConformes(porcentajeConformes);
        response.setConformidad(conformidadDTO);

        // 2. Retrabajos por fase: solo las fases rehechas (es_rehacer), agrupadas por
        // fase del catálogo. Si un rechazo deriva en rehacer dos fases, cuenta dos.
        Map<String, Long> retrabajosPorFase = new LinkedHashMap<>();
        for (OtFase fase : otFaseRepository.findAll()) {
            if (!fase.getEsRehacer()) {
                continue;
            }
            retrabajosPorFase.merge(nombreFase(fase), 1L, Long::sum);
        }
        response.setRetrabajosPorFase(retrabajosPorFase);

        // 3. Auditorías recientes (las 10 últimas por fecha de veredicto) y tiempo
        // promedio en Calidad: desde fecha_pase_calidad hasta fecha_veredicto.
        List<DashboardCalidadResponseDTO.AuditoriaRecienteDTO> auditoriasRecientes = auditorias.stream()
            .sorted(Comparator.comparing(AuditoriaCalidad::getFechaVeredicto,
                Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .map(a -> {
            DashboardCalidadResponseDTO.AuditoriaRecienteDTO dto = new DashboardCalidadResponseDTO.AuditoriaRecienteDTO();
            if (a.getOrdenTrabajo() != null) {
                dto.setIdOt(a.getOrdenTrabajo().getId());
                dto.setNumeroOt(a.getOrdenTrabajo().getNumeroOt());
            }
            dto.setResultado(a.getResultado() != null ? a.getResultado().name() : "PENDIENTE");
            dto.setFechaAuditoria(a.getFechaVeredicto() != null ? a.getFechaVeredicto().toString() : "");
            Long minutos = minutosEnCalidad(a);
            dto.setTiempoEnCalidadMinutos(minutos != null ? minutos : 0.0);
            return dto;
            })
            .collect(Collectors.toList());
        response.setAuditoriasRecientes(auditoriasRecientes);

        double promedio = auditorias.stream()
            .map(this::minutosEnCalidad)
            .filter(Objects::nonNull)
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        response.setTiempoPromedioCalidadMinutos(promedio);

        return response;
    }

    /**
     * MÉTRICAS DE PLANTA - Dashboard Global para el Gerente (HU-5.3)
     */
    @Transactional(readOnly = true)
    public DashboardPlantaDTO obtenerMetricasPlanta() {
        List<OtFase> fases = otFaseRepository.findAll();

        // 1. OT abiertas (sin entregar ni cancelar)
        // - Pendientes: todavía no arrancó ninguna fase
        // - Activas: ya arrancó al menos una
        List<OrdenTrabajo> abiertas = ordenTrabajoRepository.findAll().stream()
                .filter(ot -> ot.getEstado() != null
                        && ot.getEstado() != EstadoOT.ENTREGADA
                        && ot.getEstado() != EstadoOT.CANCELADA)
                .toList();
        Set<Long> otConFaseIniciada = fases.stream()
                .filter(f -> f.getFechaInicioReal() != null)
                .map(f -> f.getOrdenTrabajo().getId())
                .collect(Collectors.toSet());
        long pendientes = abiertas.stream()
                .filter(ot -> !otConFaseIniciada.contains(ot.getId()))
                .count();
        long activas = abiertas.size() - pendientes;

        // 2. Congestión actual: fases del catálogo activas (aunque tengan 0)
        // y cuántas tareas hay hoy en cola o en ejecución en cada una.
        Map<String, Long> fasesExistentes = new LinkedHashMap<>();
        faseRepository.findAll().stream()
                .filter(f -> Boolean.TRUE.equals(f.getActivo()))
                .forEach(f -> fasesExistentes.put(f.getNombre(), 0L));
        fases.stream()
                .filter(f -> f.getEstado() == EstadoOtFase.EN_COLA || f.getEstado() == EstadoOtFase.EN_EJECUCION)
                .forEach(f -> fasesExistentes.merge(nombreFase(f), 1L, Long::sum));

        // 3. Cuello de botella: la fase con más tareas acumuladas hoy
        String cuelloDeBotella = fasesExistentes.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .max(Map.Entry.comparingByValue())
                .map(e -> "Fase con mayor acumulación: " + e.getKey() + " (" + e.getValue() + " tareas en cola o en ejecución)")
                .orElse("No se registran acumulaciones");

        return new DashboardPlantaDTO(pendientes, activas, fasesExistentes, cuelloDeBotella);
    }
    
    private String nombreFase(OtFase fase) {
        return fase.getFaseCatalogo() != null && fase.getFaseCatalogo().getNombre() != null
            ? fase.getFaseCatalogo().getNombre()
            : "Sin fase";
    }

    // Minutos entre que la OT entró a Calidad y el veredicto. Null si falta un dato o
    // si la fecha de pase es posterior (una OT con retrabajo pisa fecha_pase_calidad).
    private Long minutosEnCalidad(AuditoriaCalidad a) {
        OffsetDateTime veredicto = a.getFechaVeredicto();
        OffsetDateTime pase = a.getOrdenTrabajo() != null ? a.getOrdenTrabajo().getFechaPaseCalidad() : null;
        if (veredicto == null || pase == null || pase.isAfter(veredicto)) {
            return null;
        }
        return Duration.between(pase, veredicto).toMinutes();
    }

}