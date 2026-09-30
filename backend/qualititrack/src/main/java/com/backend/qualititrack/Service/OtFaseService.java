package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.OtFaseReasignacionRequestDTO;
import com.backend.qualititrack.DTO.OtFaseReasignacionResponseDTO;
import com.backend.qualititrack.DTO.OtFaseResponseDTO;
import com.backend.qualititrack.DTO.RehacerFasesRequestDTO;
import com.backend.qualititrack.Enum.EstadoOT;
import com.backend.qualititrack.Enum.EstadoOtFase;
import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.exception.InvalidStateException;
import com.backend.qualititrack.modelos.OrdenTrabajo;
import com.backend.qualititrack.modelos.OtFase;
import com.backend.qualititrack.modelos.OtFaseReasignacion;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.FaseOperarioHabilitadoRepository;
import com.backend.qualititrack.repository.OrdenTrabajoRepository;
import com.backend.qualititrack.repository.OtFaseReasignacionRepository;
import com.backend.qualititrack.repository.OtFaseRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class OtFaseService {
    private final OtFaseRepository otFaseRepository;
    private final UsuarioRepository usuarioRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final OtFaseReasignacionRepository otFaseReasignacionRepository;
    private final FaseOperarioHabilitadoRepository faseOperarioHabilitadoRepository;

    public OtFaseService(OtFaseRepository otFaseRepository, UsuarioRepository usuarioRepository,
            OrdenTrabajoRepository ordenTrabajoRepository, OtFaseReasignacionRepository otFaseReasignacionRepository,
            FaseOperarioHabilitadoRepository faseOperarioHabilitadoRepository) {
        this.otFaseRepository = otFaseRepository;
        this.usuarioRepository = usuarioRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.otFaseReasignacionRepository = otFaseReasignacionRepository;
        this.faseOperarioHabilitadoRepository = faseOperarioHabilitadoRepository;
    }

    // GET /api/ot-fases (Jefe)
    @Transactional
    public List<OtFaseResponseDTO> listarFases() {
        // Retornar todas las fases, mapeadas a DTOs usando el método con relaciones
        return otFaseRepository.findAllWithRelaciones()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public List<OtFaseResponseDTO> listarFasesDeOt(Long ordenTrabajoId) {
        if (!ordenTrabajoRepository.existsById(ordenTrabajoId)) {
            throw new EntityNotFoundException("OT no encontrada con ID: " + ordenTrabajoId);
        }
        return otFaseRepository.findByOrdenTrabajoIdWithRelaciones(ordenTrabajoId).stream()
                .map(this::convertirADTO)
                .toList();
    }

    // GET /api/ot-fases (Operario)
    @Transactional
    public List<OtFaseResponseDTO> listarFasesOperario(String operarioMail) {
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El operario con email " + operarioMail + " no existe"));

        return otFaseRepository.findByOperario_Id(operario.getId())
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // POST /api/ot-fases/{id}/iniciar
    @Transactional
    public OtFaseResponseDTO iniciarFase(Long id, String operarioMail) {
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El operario con email " + operarioMail + " no existe"));

        OtFase otFase = otFaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La fase con ID " + id + " no existe"));

        validarOperarioEnFase(otFase, operario.getId());

        if (otFase.getEstado() != EstadoOtFase.EN_COLA) {
            throw new InvalidStateException(
                    "La fase con ID " + id + " no está en estado EN_COLA y no puede ser iniciada");
        }

        if (!validarFaseAnteriorTerminada(otFase)) {
            throw new InvalidStateException(
                    "La fase anterior a la fase con ID " + id
                            + " no está en estado TERMINADO y no puede iniciarse esta fase");
        }

        otFase.setEstado(EstadoOtFase.EN_EJECUCION);
        otFase.setFechaInicioReal(OffsetDateTime.now());

        OrdenTrabajo ot = otFase.getOrdenTrabajo();
        if (ot != null && ot.getFechaInicioProduccion() == null && otFase.getNumeroSecuencia() == 1) {
            ot.setFechaInicioProduccion(otFase.getFechaInicioReal());
            ordenTrabajoRepository.save(ot);
        }

        OtFase guardada = otFaseRepository.save(otFase);
        return convertirADTO(guardada);
    }

    // POST /api/ot-fases/{id}/finalizar
    @Transactional
    public OtFaseResponseDTO finalizarFase(Long id, String operarioMail) {
        Usuario operario = usuarioRepository.findByEmail(operarioMail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El operario con email " + operarioMail + " no existe"));

        OtFase otFase = otFaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La fase con ID " + id + " no existe"));

        if (otFase.getOperario() == null || !otFase.getOperario().getId().equals(operario.getId())) {
            throw new AccessDeniedException(
                    "El operario con email " + operarioMail + " no está asignado a la fase con ID " + id);
        }

        if (otFase.getEstado() != EstadoOtFase.EN_EJECUCION) {
            throw new InvalidStateException(
                    "La fase con ID " + id + " no está en estado EN_EJECUCION y no puede ser finalizada");
        } else {
            otFase.setEstado(EstadoOtFase.TERMINADO);
        }

        otFase.setFechaFinReal(OffsetDateTime.now());
        if (otFase.getFechaInicioReal() != null) {
            long duracion = java.time.Duration
                    .between(otFase.getFechaInicioReal(), otFase.getFechaFinReal())
                    .toMinutes();
            otFase.setDuracionRealMinutos((int) duracion);
        } else {
            throw new InvalidStateException("La fase no tiene una fecha de inicio real establecida.");
        }

        OtFase guardada = otFaseRepository.save(otFase);

        OtFase faseSiguiente = otFaseRepository.findNextFase(
                otFase.getOrdenTrabajo().getId(),
                otFase.getCicloIteracion(),
                otFase.getNumeroSecuencia())
                .orElse(null);

        if (faseSiguiente != null) {
            faseSiguiente.setEstado(EstadoOtFase.EN_COLA);
            faseSiguiente.setFechaVencimiento(OffsetDateTime.now()
                    .plusMinutes(faseSiguiente.getTiempoEstimadoMinutos()));
            otFaseRepository.save(faseSiguiente);
        } else {
            otFase.getOrdenTrabajo().setEstado(EstadoOT.EN_CALIDAD);
            otFase.getOrdenTrabajo().setFechaPaseCalidad(OffsetDateTime.now());
            ordenTrabajoRepository.save(otFase.getOrdenTrabajo());
        }
        return convertirADTO(guardada);
    }

    // POST /api/ot-fases (Jefe de Producción - Fases de Retrabajo)
    @Transactional
    public List<OtFaseResponseDTO> rehacerFases(RehacerFasesRequestDTO request) {
        var ordenTrabajo = ordenTrabajoRepository.findById(request.getOrdenTrabajoId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "La Orden de Trabajo con ID " + request.getOrdenTrabajoId() + " no existe"));

        if (ordenTrabajo.getEstado() != EstadoOT.NO_CONFORME) {
            throw new InvalidStateException("Solo se pueden rehacer fases de una OT no conforme");
        }

        int nuevoCiclo = otFaseRepository.findByOrdenTrabajoId(ordenTrabajo.getId()).stream()
                .mapToInt(OtFase::getCicloIteracion)
                .max().orElse(1) + 1;

        record Pedido(OtFase anterior, RehacerFasesRequestDTO.FaseRehacerDTO datos) {
        }

        List<Pedido> pedidos = request.getFases().stream()
                .map(f -> new Pedido(
                        otFaseRepository.findById(f.getFaseId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                        "La fase con ID " + f.getFaseId() + " no existe")),
                        f))
                .sorted(java.util.Comparator.comparing(p -> p.anterior().getNumeroSecuencia()))
                .toList();

        java.util.Set<Integer> secuenciasPedidas = new java.util.HashSet<>();
        for (Pedido p : pedidos) {
            if (!secuenciasPedidas.add(p.anterior().getNumeroSecuencia())) {
                throw new IllegalArgumentException(
                        "La posición " + p.anterior().getNumeroSecuencia()
                                + " viene repetida en el pedido: cada fase se puede rehacer una sola vez");
            }
        }

        List<OtFase> nuevasFasesRehacer = new java.util.ArrayList<>();
        boolean primera = true;

        for (Pedido p : pedidos) {
            OtFase faseAnterior = p.anterior();

            if (!faseAnterior.getOrdenTrabajo().getId().equals(ordenTrabajo.getId())) {
                throw new IllegalArgumentException(
                        "La fase con ID " + faseAnterior.getId() + " no pertenece a la Orden de Trabajo especificada");
            }

            OtFase ultimaVersion = otFaseRepository
                    .findFirstByOrdenTrabajoIdAndNumeroSecuenciaOrderByCicloIteracionDesc(
                            ordenTrabajo.getId(), faseAnterior.getNumeroSecuencia())
                    .orElse(faseAnterior);
            if (!ultimaVersion.getId().equals(faseAnterior.getId())) {
                throw new InvalidStateException("La fase con ID " + faseAnterior.getId()
                        + " ya fue rehecha: hay que elegir su versión más reciente");
            }
            if (faseAnterior.getEstado() != EstadoOtFase.TERMINADO) {
                throw new InvalidStateException(
                        "La fase con ID " + faseAnterior.getId() + " no está TERMINADA");
            }

            Usuario operario = usuarioRepository.findById(p.datos().getOperarioId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Operario no encontrado con ID: " + p.datos().getOperarioId()));
            if (!faseOperarioHabilitadoRepository.existsByFaseCatalogoIdAndOperarioIdAndHabilitadoTrue(
                    faseAnterior.getFaseCatalogo().getId(), operario.getId())) {
                throw new InvalidStateException("El operario " + operario.getNombre()
                        + " no está habilitado para la fase " + faseAnterior.getFaseCatalogo().getNombre());
            }

            int tiempo = p.datos().getTiempoEstimadoMinutos();
            OffsetDateTime ahora = OffsetDateTime.now();

            OtFase nuevaFase = OtFase.builder()
                    .ordenTrabajo(ordenTrabajo)
                    .faseCatalogo(faseAnterior.getFaseCatalogo())
                    .numeroSecuencia(faseAnterior.getNumeroSecuencia())
                    .operario(operario)
                    .tiempoEstimadoMinutos(tiempo)
                    .estado(primera ? EstadoOtFase.EN_COLA : EstadoOtFase.PENDIENTE)
                    .fechaVencimiento(primera ? OffsetDateTime.now().plusMinutes(tiempo) : null)
                    .esRehacer(true)
                    .cicloIteracion(nuevoCiclo)
                    .createdAt(ahora)
                    .updatedAt(ahora)
                    .build();

            nuevasFasesRehacer.add(otFaseRepository.save(nuevaFase));
            primera = false;
        }

        ordenTrabajo.setEstado(EstadoOT.EN_PRODUCCION);
        ordenTrabajoRepository.save(ordenTrabajo);

        return nuevasFasesRehacer.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public void validarOperarioEnFase(OtFase otFase, Long operarioId) {
        if (otFase.getOperario() == null || !otFase.getOperario().getId().equals(operarioId)) {
            throw new AccessDeniedException(
                    "El operario de ID " + operarioId + " no está asignado a la fase con ID " + otFase.getId());
        }
    }

    public void validarOperarioEnFase(Long otFaseId, Long operarioId) {
        OtFase otFase = otFaseRepository.findById(otFaseId)
                .orElseThrow(() -> new EntityNotFoundException("La fase con ID " + otFaseId + " no existe"));
        if (otFase.getOperario() == null || !otFase.getOperario().getId().equals(operarioId)) {
            throw new AccessDeniedException(
                    "El operario de ID " + operarioId + " no está asignado a la fase con ID " + otFase.getId());
        }
    }

    @Transactional
    public OtFaseReasignacionResponseDTO reasignarFase(Long id, OtFaseReasignacionRequestDTO dto, String jefeMail) {
        Long operarioNuevoId = dto.getOperarioNuevoId();

        Usuario operarioNuevo = usuarioRepository.findById(operarioNuevoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El operario con id " + operarioNuevoId + " no existe"));
        if (operarioNuevo.getRol() != NivelRol.OPERARIO) {
            throw new InvalidStateException("El usuario con id " + operarioNuevoId + " no es un operario");
        }
        if (!operarioNuevo.getActivo()) {
            throw new InvalidStateException(
                    "El usuario con id " + operarioNuevoId + " no está habilitado para desarrollar la tarea");
        }

        OtFase otFase = otFaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("La fase con id " + id + " no existe"));
        if (otFase.getEstado() == EstadoOtFase.TERMINADO) {
            throw new InvalidStateException("La fase con id " + id + " ya está en terminada y no puede ser reasignada");
        }
        if (otFase.getEstado() == EstadoOtFase.EN_EJECUCION) {
            throw new InvalidStateException("La fase con id " + id + " ya está en ejecución y no puede ser reasignada");
        }

        Usuario operarioAnterior = otFase.getOperario();

        if (!faseOperarioHabilitadoRepository.existsByFaseCatalogoIdAndOperarioIdAndHabilitadoTrue(
                otFase.getFaseCatalogo().getId(), operarioNuevoId)) {
            throw new InvalidStateException(
                    "El operario con id " + operarioNuevoId + " no puede realizar la fase con id "
                            + otFase.getFaseCatalogo().getId());
        }

        Usuario jefe = usuarioRepository.findByEmail(jefeMail)
                .orElseThrow(() -> new EntityNotFoundException("El usuario con email " + jefeMail + " no existe"));

        OtFaseReasignacion reasignacion = new OtFaseReasignacion();
        reasignacion.setOtFase(otFase);
        reasignacion.setOperarioAnterior(operarioAnterior);
        reasignacion.setOperarioNuevo(operarioNuevo);
        reasignacion.setReasignadoPor(jefe);
        reasignacion.setMotivo(dto.getMotivo());
        reasignacion.setFechaReasignacion(OffsetDateTime.now());
        otFaseReasignacionRepository.save(reasignacion);

        otFase.setOperario(operarioNuevo);
        otFaseRepository.save(otFase);

        OtFaseReasignacionResponseDTO response = new OtFaseReasignacionResponseDTO();
        response.setId(id);
        response.setOperarioId(operarioNuevoId);
        return response;
    }

    private boolean validarFaseAnteriorTerminada(OtFase otFase) {
        if (otFase.getNumeroSecuencia() <= 1) {
            return true;
        }

        int secuenciaAnterior = otFase.getNumeroSecuencia() - 1;
        OtFase ultimaEjecucionAnterior = otFaseRepository
                .findFirstByOrdenTrabajoIdAndNumeroSecuenciaOrderByCicloIteracionDesc(
                        otFase.getOrdenTrabajo().getId(),
                        secuenciaAnterior)
                .orElse(null);

        return ultimaEjecucionAnterior != null
                && ultimaEjecucionAnterior.getEstado() == EstadoOtFase.TERMINADO;
    }

    // Único método convertirADTO completo y actualizado con todas las relaciones
    private OtFaseResponseDTO convertirADTO(OtFase otFase) {
        return OtFaseResponseDTO.builder()
                .id(otFase.getId())
                .ordenTrabajoId(otFase.getOrdenTrabajo().getId())
                .numeroOt(otFase.getOrdenTrabajo().getNumeroOt())
                .descripcionPieza(otFase.getOrdenTrabajo().getCotizacion().getSolicitud()
                        .getDescripcionPieza())
                .cantidad(otFase.getOrdenTrabajo().getCantidad())
                .solicitudId(otFase.getOrdenTrabajo().getCotizacion().getSolicitud().getId())
                .faseCatalogoId(otFase.getFaseCatalogo().getId())
                .faseNombre(otFase.getFaseCatalogo().getNombre())
                .numeroSecuencia(otFase.getNumeroSecuencia())
                .operarioId(otFase.getOperario() != null ? otFase.getOperario().getId() : null)
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