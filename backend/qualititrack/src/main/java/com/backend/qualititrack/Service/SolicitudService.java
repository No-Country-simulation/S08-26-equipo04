package com.backend.qualititrack.Service;

import com.backend.qualititrack.DTO.SolicitudDTO;
import com.backend.qualititrack.Enum.EstadoSolicitud;
import com.backend.qualititrack.modelos.Cliente;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.ClienteRepository;
import com.backend.qualititrack.repository.SolicitudRepositorio;
import com.backend.qualititrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudService {
    // Inyección de dependencias a través del constructor
    @Autowired
    private SolicitudRepositorio solicitudRepositorio;
    @Autowired
    private ClienteRepository clienteRepositorio;
    @Autowired
    private UsuarioRepository usuarioRepositorio;

    public SolicitudService(SolicitudRepositorio solicitudRepositorio, ClienteRepository clienteRepositorio, UsuarioRepository usuarioRepositorio) {
        this.solicitudRepositorio = solicitudRepositorio;
        this.clienteRepositorio = clienteRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    private String generarNumeroSolicitud() {
        // Lógica para generar un número de solicitud único
        // Por ejemplo, podrías usar un contador o un UUID
        return "SOL-" + System.currentTimeMillis(); // Ejemplo simple usando timestamp
    }

    public SolicitudDTO crear(SolicitudDTO dto, Long vendedorId) {

        // 1. Validar y obtener el Cliente desde la BD
        Cliente cliente = clienteRepositorio.findById(dto.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "El cliente con ID " + dto.getClienteId() + " no existe"));

        // 2. Validar y obtener el Vendedor desde la BD
        Usuario vendedor = usuarioRepositorio.findById(vendedorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El vendedor con ID " + vendedorId + " no existe"));

        // 3. Lógica para crear una solicitud
        Solicitud solicitud = new Solicitud();
        solicitud.setCliente(cliente);
        solicitud.setVendedor(vendedor);
        solicitud.setNumeroSolicitud(dto.getNumeroSolicitud());
        solicitud.setFechaEsperadaEntrega(dto.getFechaEsperadaEntrega());
        solicitud.setDescripcionPieza(dto.getDescripcionPieza());
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setNotasComerciales(dto.getNotasComerciales());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE_COTIZACION); // Estado inicial

        // Guardar en BD
        Solicitud guardada = solicitudRepositorio.save(solicitud);

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
        dto.setClienteId(solicitud.getCliente().getId());
        dto.setCantidad(solicitud.getCantidad());
        dto.setNotasComerciales(solicitud.getNotasComerciales());
        dto.setEstado(solicitud.getEstado());
        return dto;
    }
}
