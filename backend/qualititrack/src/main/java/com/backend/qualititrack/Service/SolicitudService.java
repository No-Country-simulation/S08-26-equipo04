package com.backend.qualititrack.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.qualititrack.DTO.SolicitudDTO;
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

    public SolicitudDTO crear(SolicitudDTO dto, Long vendedorId) {
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

        // 2. Validar y obtener el Vendedor desde la BD
        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El vendedor con ID " + vendedorId + " no existe"));

        // 3. Lógica para crear una solicitud
        Solicitud solicitud = new Solicitud();
        solicitud.setCliente(cliente);
        solicitud.setVendedor(vendedor);
        solicitud.setNumeroSolicitud(generarNumeroSolicitud());
        solicitud.setFechaEsperadaEntrega(dto.getFechaEsperadaEntrega());
        solicitud.setDescripcionPieza(dto.getDescripcionPieza());
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setNotasComerciales(dto.getNotasComerciales());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE_COTIZACION); // Estado inicial

        // Guardar en BD
        Solicitud guardada = solicitudRepository.save(solicitud);

        // Retornar nueva solicitud en forma de dto
        return convertirADTO(guardada);
    }

    public List<SolicitudDTO> obtenerLista() {
        return null;
    }

    private SolicitudDTO convertirADTO(Solicitud solicitud) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setId(solicitud.getId());
        dto.setNumeroSolicitud(solicitud.getNumeroSolicitud());
        dto.setFechaEsperadaEntrega(solicitud.getFechaEsperadaEntrega());
        dto.setDescripcionPieza(solicitud.getDescripcionPieza());
        dto.setCantidad(solicitud.getCantidad());
        dto.setNotasComerciales(solicitud.getNotasComerciales());
        dto.setEstado(solicitud.getEstado());
        return dto;
    }
}