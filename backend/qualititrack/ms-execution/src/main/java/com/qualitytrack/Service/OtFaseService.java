package com.qualitytrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import com.qualitytrack.DTO.OtFaseResponseDTO;
import com.qualitytrack.Enum.EstadoOT;
import com.qualitytrack.Enum.EstadoOtFase;
import com.qualitytrack.modelos.OtFase;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.OrdenTrabajoRepository;
import com.qualitytrack.repository.OtFaseRepository;
import com.qualitytrack.repository.UsuarioRepository;

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
                otFase.getOrdenTrabajo().setEstado(EstadoOT.CALIDAD);
                otFase.getOrdenTrabajo().setFechaPaseCalidad(OffsetDateTime.now());
                ordenTrabajoRepository.save(otFase.getOrdenTrabajo());
            }
        return convertirADTO(guardada);
    }


    private OtFaseResponseDTO convertirADTO(OtFase otFase) {
        OtFaseResponseDTO dto = new OtFaseResponseDTO();
        dto.setId(otFase.getId());
        dto.setOrdenTrabajoId(otFase.getOrdenTrabajo() != null ? otFase.getOrdenTrabajo().getId() : null);
        dto.setFaseCatalogoId(otFase.getFaseCatalogo() != null ? otFase.getFaseCatalogo().getId() : null);
        dto.setNumeroSecuencia(otFase.getNumeroSecuencia());
        dto.setOperarioId(otFase.getOperario() != null ? otFase.getOperario().getId() : null);
        dto.setTiempoEstimadoMinutos(otFase.getTiempoEstimadoMinutos());
        dto.setFechaVencimiento(otFase.getFechaVencimiento());
        dto.setEstado(otFase.getEstado());
        dto.setFechaInicioReal(otFase.getFechaInicioReal());
        dto.setFechaFinReal(otFase.getFechaFinReal());
        dto.setDuracionRealMinutos(otFase.getDuracionRealMinutos());
        dto.setEsRehacer(otFase.getEsRehacer());
        dto.setCicloIteracion(otFase.getCicloIteracion());
        dto.setCreatedAt(otFase.getCreatedAt());
        dto.setUpdatedAt(otFase.getUpdatedAt());
        return dto;
}}
