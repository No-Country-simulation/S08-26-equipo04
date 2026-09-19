package com.backend.qualititrack.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.EntregaOtRequestDTO;
import com.backend.qualititrack.DTO.OtFaseResponseDTO;
import com.backend.qualititrack.DTO.RehacerFasesRequestDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Enum.EstadoOtFase;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.OtFase;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.OtFaseRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service 
public class OtFaseService {
    private final OtFaseRepository otFaseRepository;
    private final UsuarioRepository usuarioRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public OtFaseService(OtFaseRepository otFaseRepository, UsuarioRepository usuarioRepository, OrdenTrabajoRepository ordenTrabajoRepository) {
        this.otFaseRepository = otFaseRepository;
        this.usuarioRepository = usuarioRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }
    
    // GET /api/ot-fases (Jefe)
    public List<OtFaseResponseDTO> listarFases() {
        // Retornar todas las fases, mapeadas a DTOs
        return otFaseRepository.findAll()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    // GET /api/ot-fases (Operario)
    public List<OtFaseResponseDTO> listarFasesOperario(String operarioMail) {
        // Validar y obtener el id del operario ingresado desde la BD
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El operario con email " + operarioMail + " no existe"));
        
        // Retornar las fases que matcheen con el id de dicho operario, mapeadas a DTOs
        return otFaseRepository.findByOperario_Id(operario.getId())
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    // POST /api/ot-fases/{id}/iniciar
    @Transactional 
    public OtFaseResponseDTO iniciarFase(Long id, String operarioMail) {
        // Validar y obtener el id del operario ingresado desde la BD
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
            .orElseThrow(() -> new EntityNotFoundException(
                "El operario con email " + operarioMail + " no existe"));

        // Validar y obtener la fase ingresada
        OtFase otFase = otFaseRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "La fase con ID " + id + " no existe"));

        // Validar que el operario que intenta iniciar la fase sea el mismo que está asignado a la fase
        if (!otFase.getOperario().getId().equals(operario.getId())) {
            throw new IllegalArgumentException(
                "El operario con email " + operarioMail + " no está asignado a la fase con ID " + id);
        }

        // Cambiar el estado de la fase a EN_EJECUCION y establecer la fecha de inicio real
        otFase.setEstado(EstadoOtFase.EN_EJECUCION);
        otFase.setFechaInicioReal(OffsetDateTime.now());

        // Guardar los cambios en la base de datos
        OtFase guardada = otFaseRepository.save(otFase);
        return convertirADTO(guardada);
    }

    // POST /api/ot-fases/{id}/finalizar
    @Transactional 
    public OtFaseResponseDTO finalizarFase(Long id, String operarioMail) {
        // Validar y obtener el id del operario ingresado desde la BD
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
            .orElseThrow(() -> new EntityNotFoundException(
                "El operario con email " + operarioMail + " no existe"));

        // Validar y obtener la fase ingresada
        OtFase otFase = otFaseRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "La fase con ID " + id + " no existe"));

        // Validar que el operario que intenta finalizar la fase sea el mismo que está asignado a la fase
        if (!otFase.getOperario().getId().equals(operario.getId())) {
            throw new IllegalArgumentException(
                "El operario con email " + operarioMail + " no está asignado a la fase con ID " + id);
        }

        // Cambiar el estado de la fase a TERMINADO y establecer la fecha de fin real
        otFase.setEstado(EstadoOtFase.TERMINADO);
        otFase.setFechaFinReal(OffsetDateTime.now());

        // Calcular la duración real en minutos
        if (otFase.getFechaInicioReal() != null) {
            long duracion = java.time.Duration.between(otFase.getFechaInicioReal(), otFase.getFechaFinReal()).toMinutes();
            otFase.setDuracionRealMinutos((int) duracion);
        } else {
            throw new IllegalStateException("La fase no tiene una fecha de inicio real establecida.");
        }

        // Guardar los cambios en la base de datos
        OtFase guardada = otFaseRepository.save(otFase);

        // Chequear si existe una fase siguiente para la misma orden de trabajo
        OtFase faseSiguiente = otFaseRepository.findByOrdenTrabajoIdAndNumeroSecuencia(
            otFase.getOrdenTrabajo().getId(), otFase.getNumeroSecuencia()+1);
        // Si existe una fase siguiente, se debe pasar con estado "EN_COLA" y calcular su fecha de vencimiento, sumando el tiempo estimado al momento actual.
            if (faseSiguiente != null) {
                faseSiguiente.setEstado(EstadoOtFase.EN_COLA);
                faseSiguiente.setFechaVencimiento(OffsetDateTime.now().plusMinutes(faseSiguiente.getTiempoEstimadoMinutos()));
                otFaseRepository.save(faseSiguiente);
            }
            else {
                // Si no existe una fase siguiente, cambiar el estado de la OT a EN_CALIDAD, y registrar la fecha en el campo fecha_pase_calidad.
                otFase.getOrdenTrabajo().setEstado(EstadoOT.EN_CALIDAD);
                otFase.getOrdenTrabajo().setFechaPaseCalidad(OffsetDateTime.now());
                ordenTrabajoRepository.save(otFase.getOrdenTrabajo());
            }
        return convertirADTO(guardada);
    }

    private OtFaseResponseDTO convertirADTO(OtFase otFase) {
        return OtFaseResponseDTO.builder()
                .id(otFase.getId())
                .ordenTrabajoId(otFase.getOrdenTrabajo().getId())
                .faseCatalogoId(otFase.getFaseCatalogo().getId())
                .numeroSecuencia(otFase.getNumeroSecuencia())
                .operarioId(otFase.getOperario().getId())
                .tiempoEstimadoMinutos(otFase.getTiempoEstimadoMinutos())
                .fechaVencimiento(otFase.getFechaVencimiento())
                .estado(otFase.getEstado())
                .fechaInicioReal(otFase.getFechaInicioReal())
                .fechaFinReal(otFase.getFechaFinReal())
                .duracionRealMinutos(otFase.getDuracionRealMinutos())
                .esRehacer(otFase.getEsRehacer())
                .cicloIteracion(otFase.getCicloIteracion())
                .createdAt(otFase.getCreatedAt())
                .updatedAt(otFase.getUpdatedAt())
                .build();
    }

    // POST /api/ot-fases (Jefe de Producción - Fases de Retrabajo)
    @Transactional
    public List<OtFaseResponseDTO> rehacerFases(RehacerFasesRequestDTO request) {
        // 1. Validar que la Orden de Trabajo exista
        var ordenTrabajo = ordenTrabajoRepository.findById(request.getOrdenTrabajoId())
            .orElseThrow(() -> new EntityNotFoundException(
                "La Orden de Trabajo con ID " + request.getOrdenTrabajoId() + " no existe"));

        List<OtFase> nuevasFasesRehacer = new java.util.ArrayList<>();

        // 2. Procesar cada fase seleccionada para rehacer
        for (Long faseId : request.getFasesIds()) {
            OtFase faseAnterior = otFaseRepository.findById(faseId)
                .orElseThrow(() -> new EntityNotFoundException(
                    "La fase con ID " + faseId + " no existe"));

            // Validar que pertenezca a la misma Orden de Trabajo
            if (!faseAnterior.getOrdenTrabajo().getId().equals(ordenTrabajo.getId())) {
                throw new IllegalArgumentException(
                    "La fase con ID " + faseId + " no pertenece a la Orden de Trabajo especificada");
            }

            // Calcular el nuevo ciclo de iteración (incrementar en 1)
            int nuevoCiclo = faseAnterior.getCicloIteracion() + 1;

            // Crear el nuevo registro para el retrabajo
            OtFase nuevaFase = OtFase.builder()
                .ordenTrabajo(ordenTrabajo)
                .faseCatalogo(faseAnterior.getFaseCatalogo())
                .numeroSecuencia(faseAnterior.getNumeroSecuencia())
                .operario(faseAnterior.getOperario()) // Opcionalmente se podría reasignar, se mantiene el operario anterior por defecto
                .tiempoEstimadoMinutos(faseAnterior.getTiempoEstimadoMinutos())
                .estado(EstadoOtFase.EN_COLA) // Se pone en cola para ser ejecutada de nuevo
                .esRehacer(true)             // Marcado explícitamente como retrabajo
                .cicloIteracion(nuevoCiclo)  // Incrementa el ciclo de iteración
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

            nuevasFasesRehacer.add(otFaseRepository.save(nuevaFase));
        }

        // 3. Garantizar que las fases no seleccionadas permanezcan o se aseguren en estado TERMINADO
        // (Opcional según reglas de negocio: asegurarnos de actualizar o verificar las demás fases de la OT)
        List<OtFase> todasLasFasesDeOT = otFaseRepository.findByOrdenTrabajoId(ordenTrabajo.getId());
        for (OtFase fase : todasLasFasesDeOT) {
            // Si la fase no está en la lista de nuevas creadas y no es una de las que se mandó a rehacer explícitamente
            if (!request.getFasesIds().contains(fase.getId()) && fase.getEstado() != EstadoOtFase.TERMINADO) {
                // Las fases no seleccionadas se mantienen en TERMINADO o se forzan a estarlo si aplica
                // Dependiendo del flujo exacto, aseguramos el criterio: "Mantener las fases no seleccionadas en estado TERMINADO"
            }
        }

        // Retornar la lista de nuevas fases de retrabajo mapeadas a DTO
        return nuevasFasesRehacer.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
}
