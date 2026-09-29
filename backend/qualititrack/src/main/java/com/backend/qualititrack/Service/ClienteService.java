package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.qualititrack.DTO.ClienteDTO;
import com.backend.qualititrack.exception.EntityNotFoundException;
import com.backend.qualititrack.exception.InvalidStateException;
import com.backend.qualititrack.modelos.Cliente;
import com.backend.qualititrack.repository.ClienteRepository;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public ClienteDTO crear(ClienteDTO clienteDTO) {
        // valida si el email ya existe
        if (clienteRepository.findByEmail(clienteDTO.getEmail()).isPresent()) {
            throw new InvalidStateException("El email " + clienteDTO.getEmail() + " ya está registrado");
        }
        
        // valida si el cuit ya existe
        if (clienteRepository.findByCuit(clienteDTO.getCuit()).isPresent()) {
            throw new InvalidStateException("El cuit " + clienteDTO.getCuit() + " ya está registrado en un cliente existente");
        }

        Cliente cliente = new Cliente();
        cliente.setContactoNombre(clienteDTO.getContactoNombre());
        cliente.setCuit(clienteDTO.getCuit());
        cliente.setDireccion(clienteDTO.getDireccion());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setTelefono(clienteDTO.getTelefono());
        cliente.setRazonSocial(clienteDTO.getRazonSocial());
        cliente.setCreatedAt(OffsetDateTime.now());
        cliente.setActivo(true);

        Cliente clienteGuardado = clienteRepository.save(cliente);

        return convertirADTO(clienteGuardado);
    }

    @Transactional(readOnly = true)
    public ClienteDTO obtenerPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente con ID " + id + "no encontrado"));
        return convertirADTO(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteDTO obtenerPorEmail(String email) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Cliente con email " + email + " no encontrado"));
        return convertirADTO(cliente);
    }

    @Transactional(readOnly = true)
    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClienteDTO actualizar(Long id, ClienteDTO clienteDTO) {
        // Verificar que el cliente existe
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente con ID " + id + " no encontrado"));

        // Validar que el email no esté registrado en otro cliente
        if (!cliente.getEmail().equals(clienteDTO.getEmail())) {
            if (clienteRepository.findByEmail(clienteDTO.getEmail()).isPresent()) {
                throw new InvalidStateException("El email " + clienteDTO.getEmail() + " ya está registrado");
            }
        }

        // Actualizar los datos
        if (clienteDTO.getContactoNombre() != null && !clienteDTO.getContactoNombre().isBlank()) {
            cliente.setContactoNombre(clienteDTO.getContactoNombre());
        }

        if (clienteDTO.getEmail() != null && !clienteDTO.getEmail().isBlank()) {
            cliente.setEmail(clienteDTO.getEmail());
        }

        if (clienteDTO.getTelefono() != null && !clienteDTO.getTelefono().isBlank()) {
            cliente.setTelefono(clienteDTO.getTelefono());
        }

        // Guardar cambios
        Cliente clienteActualizado = clienteRepository.save(cliente);
        return convertirADTO(clienteActualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente con ID " + id + " no encontrado"));

        // Borrado lógico mediante campo "activo"
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    private ClienteDTO convertirADTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setContactoNombre(cliente.getContactoNombre());
        dto.setEmail(cliente.getEmail());
        dto.setCuit(cliente.getCuit());
        dto.setTelefono(cliente.getTelefono());
        dto.setCreatedAt(cliente.getCreatedAt());
        dto.setUpdatedAt(cliente.getUpdatedAt());
        dto.setRazonSocial(cliente.getRazonSocial());
        dto.setDireccion(cliente.getDireccion());
        dto.setActivo(cliente.getActivo());
        return dto;
    }
}
