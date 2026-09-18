package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.OtFaseResponseDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Enum.EstadoOtFase;
import com.backend.qualititrack.exception.InvalidStateException;
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

        // Validar que el operario que intenta iniciar la fase sea el mismo que está
        // asignado a la fase
        if (otFase.getOperario() == null || !otFase.getOperario().getId().equals(operario.getId())) {
            throw new AccessDeniedException(
                    "El operario con email " + operarioMail + " no está asignado a la fase con ID " + id);
        }

        // Validar que la fase en cuestión esta en estado EN_COLA
        if (otFase.getEstado() != EstadoOtFase.EN_COLA) {
            throw new InvalidStateException(
                    "La fase con ID " + id + " no está en estado EN_COLA y no puede ser iniciada");
        }

        // Cambiar el estado de la fase a EN_EJECUCION y establecer la fecha de inicio
        // real
        otFase.setEstado(EstadoOtFase.EN_EJECUCION);
        otFase.setFechaInicioReal(OffsetDateTime.now());

        // Si es la primera ejecucion de la primera fase de la OT, debe registrarse como el inicio de ella
        OrdenTrabajo ot = otFase.getOrdenTrabajo();
        if (ot != null && ot.getFechaInicioProduccion() == null && otFase.getNumeroSecuencia() == 1) {
            ot.setFechaInicioProduccion(otFase.getFechaInicioReal());
            ordenTrabajoRepository.save(ot);
        }

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

        // Validar que el operario que intenta finalizar la fase sea el mismo que está
        // asignado a la fase
        if (otFase.getOperario() == null || !otFase.getOperario().getId().equals(operario.getId())) {
            throw new AccessDeniedException(
                    "El operario con email " + operarioMail + " no está asignado a la fase con ID " + id);
        }

        // Validar que la fase en cuestión esta en estado EN_EJECUCION antes de TERMINAR
        if (otFase.getEstado() != EstadoOtFase.EN_EJECUCION) {
            throw new InvalidStateException(
                    "La fase con ID " + id + " no está en estado EN_EJECUCION y no puede ser finalizada");
        } else {
            otFase.setEstado(EstadoOtFase.TERMINADO);
        }

        // Establecer la duracion/fecha de fin real en minutos
        otFase.setFechaFinReal(OffsetDateTime.now());
        if (otFase.getFechaInicioReal() != null) {
            long duracion = java.time.Duration.between(otFase.getFechaInicioReal(), otFase.getFechaFinReal())
                    .toMinutes();
            otFase.setDuracionRealMinutos((int) duracion);
        } else {
            throw new InvalidStateException("La fase no tiene una fecha de inicio real establecida.");
        }

        // Guardar los cambios en la base de datos
        OtFase guardada = otFaseRepository.save(otFase);

        // Chequear si existe una fase siguiente para la misma orden de trabajo
        OtFase faseSiguiente = otFaseRepository.findByOrdenTrabajoIdAndNumeroSecuenciaAndCicloIteracion(
                otFase.getOrdenTrabajo().getId(), otFase.getNumeroSecuencia() + 1, otFase.getCicloIteracion());
        // Si existe una fase siguiente, se debe pasar con estado "EN_COLA" y calcular
        // su fecha de vencimiento, sumando el tiempo estimado al momento actual.
        if (faseSiguiente != null) {
            faseSiguiente.setEstado(EstadoOtFase.EN_COLA);
            faseSiguiente
                    .setFechaVencimiento(OffsetDateTime.now().plusMinutes(faseSiguiente.getTiempoEstimadoMinutos()));
            otFaseRepository.save(faseSiguiente);
        } else {
            // Si no existe una fase siguiente, cambiar el estado de la OT a EN_CALIDAD, y
            // registrar la fecha en el campo fecha_pase_calidad.
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
}
