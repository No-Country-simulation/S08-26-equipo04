package com.backend.qualititrack.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.SolicitudDTO;
import com.backend.qualititrack.DTO.SolicitudResponseDTO;
import com.backend.qualititrack.Enum.EstadoSolicitud;
import com.backend.qualititrack.exception.InvalidStateException;
import com.backend.qualititrack.modelos.Cliente;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.ClienteRepository;
import com.backend.qualititrack.repository.SolicitudRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class SolicitudService {
    // Inyección de dependencias a través del constructor
    private final SolicitudRepository solicitudRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository) {
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private String generarNumeroSolicitud() {
        // Generador temporal. Para producción, lo ideal es buscar el MAX(id) en BD y
        // sumarle 1.
        return "SOL-" + System.currentTimeMillis();
    }

    // Devuelve en una lista los campos faltantes para crear un cliente en un dto de
    // solicitud.
    private List<String> camposFaltantesNuevoCliente(SolicitudDTO dto) {
        List<String> faltantes = new ArrayList<>();
        if (dto.getRazonSocial() == null || dto.getRazonSocial().isBlank()) {
            faltantes.add("razonSocial");
        }
        if (dto.getContactoNombre() == null || dto.getContactoNombre().isBlank()) {
            faltantes.add("contactoNombre");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            faltantes.add("email");
        }
        if (dto.getCuit() == null || dto.getCuit().isBlank()) {
            faltantes.add("cuit");
        }
        if (dto.getTelefono() == null || dto.getTelefono().isBlank()) {
            faltantes.add("telefono");
        }
        if (dto.getDireccion() == null || dto.getDireccion().isBlank()) {
            faltantes.add("direccion");
        }
        return faltantes;
    }

    // Crea una nueva
    @Transactional 
    public SolicitudResponseDTO crear(SolicitudDTO dto, String vendedorMail) {
        Cliente cliente;

        // Si el cliente existe, se utiliza
        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "El cliente con ID " + dto.getClienteId() + " no existe"));
        } else {
            // si no, verificar que se tengan los datos necesarios para crear un nuevo
            // cliente
            List<String> faltantes = camposFaltantesNuevoCliente(dto);
            if (!faltantes.isEmpty()) {
                throw new InvalidStateException(
                        "Faltan datos obligatorios para crear el nuevo cliente: " + String.join(", ", faltantes));
            }
            // Chequear que el cuit sea efectivamente único
            if (clienteRepository.findByCuit(dto.getCuit()).isPresent()) {
                throw new InvalidStateException(
                        "El cuit " + dto.getCuit() + " ya está registrado en un cliente existente");
            }
            // si están todos los datos, generar el cliente
            Cliente nuevoCliente = new Cliente();
            nuevoCliente.setRazonSocial(dto.getRazonSocial());
            nuevoCliente.setContactoNombre(dto.getContactoNombre());
            nuevoCliente.setCuit(dto.getCuit());
            nuevoCliente.setTelefono(dto.getTelefono());
            nuevoCliente.setDireccion(dto.getDireccion());
            nuevoCliente.setEmail(dto.getEmail());
            nuevoCliente.setActivo(true);
            cliente = clienteRepository.save(nuevoCliente);
        }

        // Validar y obtener el Vendedor desde la BD
        Usuario vendedor = usuarioRepository.findByEmail(vendedorMail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El vendedor con email " + vendedorMail + " no existe"));

        // Lógica para crear una solicitud
        Solicitud solicitud = new Solicitud();
        solicitud.setCliente(cliente);
        solicitud.setVendedor(vendedor);
        solicitud.setNumeroSolicitud(generarNumeroSolicitud()); // generar id nuevo
        solicitud.setFechaEsperadaEntrega(dto.getFechaEsperadaEntrega());
        solicitud.setDescripcionPieza(dto.getDescripcionPieza());
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setNotasComerciales(dto.getNotasComerciales());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE_COTIZACION); // estado inicial por defecto

        // Guardar en BD
        Solicitud guardada = solicitudRepository.save(solicitud);

        // Retornar nueva solicitud en forma de dto
        return convertirAResponseDTO(guardada);
    }

    // (Jefe de producción) Devuelve las solicitudes sin cotizar.
    public List<SolicitudDTO> obtenerPendientes() {
        return solicitudRepository.findByEstado(EstadoSolicitud.PENDIENTE_COTIZACION)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // (Vendedor) Devuelve todas las solicitudes, pendientes y cotizadas.
    public List<SolicitudDTO> obtenerTodas() {
        return solicitudRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Convierte una entidad Solicitud a un DTO de respuesta
    private SolicitudDTO convertirADTO(Solicitud solicitud) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setId(solicitud.getId());
        dto.setNumeroSolicitud(solicitud.getNumeroSolicitud());
        dto.setFechaEsperadaEntrega(solicitud.getFechaEsperadaEntrega());
        dto.setDescripcionPieza(solicitud.getDescripcionPieza());
        dto.setCantidad(solicitud.getCantidad());
        dto.setNotasComerciales(solicitud.getNotasComerciales());
        dto.setEstado(solicitud.getEstado());
        dto.setCreatedAt(solicitud.getCreatedAt());
        dto.setUpdatedAt(solicitud.getUpdatedAt());
        dto.setClienteId(solicitud.getCliente().getId());
        return dto;
    }

    // Convierte una entidad Solicitud a un DTO de respuesta
    private SolicitudResponseDTO convertirAResponseDTO(Solicitud solicitud) {
        SolicitudResponseDTO dto = new SolicitudResponseDTO();
        dto.setId(solicitud.getId());
        dto.setNumeroSolicitud(solicitud.getNumeroSolicitud());
        dto.setEstado(solicitud.getEstado());
        return dto;
    }
}