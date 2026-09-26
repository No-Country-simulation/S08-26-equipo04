package com.qualitytrack.Service;

import com.qualitytrack.DTO.SolicitudDTO;
import com.qualitytrack.Enum.EstadoSolicitud;
import com.qualitytrack.modelos.Cliente;
import com.qualitytrack.modelos.Solicitud;
import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.ClienteRepository;
import com.qualitytrack.repository.SolicitudRepositorio;
import com.qualitytrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SolicitudService {

    @Autowired
    private SolicitudRepositorio solicitudRepositorio;

    @Autowired
    private ClienteRepository clienteRepositorio;

    @Autowired
    private UsuarioRepository usuarioRepositorio;

    private String generarNumeroSolicitud() {
        // Genera número único usando timestamp
        int ano = java.time.Year.now().getValue();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("SOL-%d-%04d", ano, timestamp);
    }

    /**
     * 1. CREAR SOLICITUD - VENDEDOR crea solicitud
     * Estado inicial: PENDIENTE_COTIZACION
     */
    public SolicitudDTO crear(SolicitudDTO dto, Long vendedorId) {

        // 1. Validar y obtener el Cliente desde la BD
        Cliente cliente = clienteRepositorio.findById(dto.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "El cliente con ID " + dto.getClienteId() + " no existe"));

        // 2. Validar y obtener el Vendedor desde la BD
        Usuario vendedor = usuarioRepositorio.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El vendedor con ID " + vendedorId + " no existe"));

        // 3. Validar rol del vendedor
        if (!vendedor.getRol().toString().equals("VENDEDOR")) {
            throw new IllegalArgumentException("Solo vendedores pueden crear solicitudes");
        }

        // 4. Lógica para crear una solicitud
        Solicitud solicitud = new Solicitud();
        solicitud.setCliente(cliente);
        solicitud.setVendedor(vendedor);
        solicitud.setNumeroSolicitud(generarNumeroSolicitud());
        solicitud.setFechaEsperadaEntrega(dto.getFechaEsperadaEntrega());
        solicitud.setDescripcionPieza(dto.getDescripcionPieza());
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setNotasComerciales(dto.getNotasComerciales());
        solicitud.setPlanoUrl(dto.getPlanoUrl());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE_COTIZACION);
        solicitud.setFechaCreacion(LocalDateTime.now());

        // Guardar en BD
        Solicitud guardada = solicitudRepositorio.save(solicitud);

        // Retornar nueva solicitud en forma de DTO
        return convertirADTO(guardada);
    }

    /**
     * 2. OBTENER SOLICITUD POR ID
     */
    @Transactional(readOnly = true)
    public SolicitudDTO obtenerPorId(Long id) {
        Solicitud solicitud = solicitudRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        return convertirADTO(solicitud);
    }

    /**
     * 3. LISTAR TODAS LAS SOLICITUDES
     */
    @Transactional(readOnly = true)
    public List<SolicitudDTO> listarTodas() {
        return solicitudRepositorio.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * 4. LISTAR SOLICITUDES PENDIENTES DE COTIZACIÓN
     */
    @Transactional(readOnly = true)
    public List<SolicitudDTO> listarPendientes() {
        return solicitudRepositorio.findByEstado(EstadoSolicitud.PENDIENTE_COTIZACION.toString()).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * 5. LISTAR SOLICITUDES POR CLIENTE
     */
    @Transactional(readOnly = true)
    public List<SolicitudDTO> listarPorCliente(Long clienteId) {
        return solicitudRepositorio.findByClienteId(clienteId).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertir Solicitud a SolicitudDTO
     */
    private SolicitudDTO convertirADTO(Solicitud solicitud) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setId(solicitud.getId());
        dto.setNumeroSolicitud(solicitud.getNumeroSolicitud());
        dto.setFechaEsperadaEntrega(solicitud.getFechaEsperadaEntrega());
        dto.setDescripcionPieza(solicitud.getDescripcionPieza());
        dto.setClienteId(solicitud.getCliente().getId());
        dto.setCantidad(solicitud.getCantidad());
        dto.setNotasComerciales(solicitud.getNotasComerciales());
        dto.setEstado(solicitud.getEstado());
        dto.setPlanoUrl(solicitud.getPlanoUrl());
        dto.setFechaCreacion(solicitud.getFechaCreacion());
        return dto;
    }
}