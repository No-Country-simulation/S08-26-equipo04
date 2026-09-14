package com.backend.qualititrack.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.SolicitudDTO;
import com.backend.qualititrack.DTO.SolicitudResponseDTO;
import com.backend.qualititrack.Enum.EstadoSolicitud;
import com.backend.qualititrack.modelos.Cliente;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.ClienteRepository;
import com.backend.qualititrack.repository.SolicitudRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class SolicitudService {
    // Inyección de dependencias a través del constructor
    private final SolicitudRepository solicitudRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, ClienteRepository clienteRepository, UsuarioRepository usuarioRepository) {
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private String generarNumeroSolicitud() {
        // Generador temporal. Para producción, lo ideal es buscar el MAX(id) en BD y sumarle 1.
        return "SOL-" + System.currentTimeMillis(); 
    }

    // Crea una nueva
    public SolicitudResponseDTO crear(SolicitudDTO dto, String vendedorMail) {
        Cliente cliente;

        // Si el cliente existe, se utiliza
        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new EntityNotFoundException("El cliente con ID " + dto.getClienteId() + " no existe"));
        } else {
            // si no, se utilizan los datos del DTO para crear un nuevo cliente
            Cliente nuevoCliente = new Cliente();
            nuevoCliente.setRazonSocial(dto.getRazonSocial());
            nuevoCliente.setContactoNombre(dto.getContactoNombre());
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

    // Devuelve la lista de solicitudes pendientes.
    public List<SolicitudDTO> obtenerLista() {
        return solicitudRepository.findByEstado(EstadoSolicitud.PENDIENTE_COTIZACION)
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
        dto.setNumero_solicitud(solicitud.getNumeroSolicitud());
        dto.setEstado(solicitud.getEstado());
        return dto;
    }
}