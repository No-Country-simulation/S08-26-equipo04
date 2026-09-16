package com.backend.qualititrack.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.qualititrack.DTO.ClienteDTO;
import com.backend.qualititrack.modelos.Cliente;
import com.backend.qualititrack.repository.ClienteRepository;


@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public ClienteDTO crear(ClienteDTO clienteDTO){
        //valida si el email ya existe
        if(clienteRepository.findByEmail(clienteDTO.getEmail()).isPresent()){
            throw new IllegalArgumentException("El email" + clienteDTO.getEmail() + "ya esta registrado");

        }
        if (clienteDTO.getContactoNombre() == null || clienteDTO.getContactoNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente no puede estar vacío");
        }

        if (clienteDTO.getTelefono() == null || clienteDTO.getTelefono().isBlank()) {
            throw new IllegalArgumentException("El teléfono del cliente no puede estar vacío");
        }
        Cliente cliente = new Cliente();
        cliente.setContactoNombre(clienteDTO.getContactoNombre());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setTelefono(clienteDTO.getTelefono());
        cliente.setCreatedAt(OffsetDateTime.now());

        Cliente clienteGuardado = clienteRepository.save(cliente);

        return convertirADTO(clienteGuardado);}

    @Transactional(readOnly = true)
    public ClienteDTO obtenerPorId(Long id){
         Cliente cliente = clienteRepository.findById(id)
                 .orElseThrow(() -> new IllegalArgumentException("Cliente con ID " + id + "no encontrado"));
            return convertirADTO(cliente);
        }

    @Transactional(readOnly = true)
    public ClienteDTO obtenerPorEmail(String email) {
         Cliente cliente = clienteRepository.findByEmail(email)
                 .orElseThrow(() -> new IllegalArgumentException("Cliente con email " + email + " no encontrado"));
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
                    .orElseThrow(() -> new IllegalArgumentException("Cliente con ID " + id + " no encontrado"));

            // Validar que el email no esté registrado en otro cliente
            if (!cliente.getEmail().equals(clienteDTO.getEmail())) {
                if (clienteRepository.findByEmail(clienteDTO.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("El email " + clienteDTO.getEmail() + " ya está registrado");
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
                    .orElseThrow(() -> new IllegalArgumentException("Cliente con ID " + id + " no encontrado"));

            // Borrado lógico - se puede implementar con un campo 'activo' si es necesario
            // Por ahora, hacemos borrado físico ya que Cliente no tiene solicitudes críticas
        clienteRepository.delete(cliente);
        }

    private ClienteDTO convertirADTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setContactoNombre(cliente.getContactoNombre());
        dto.setEmail(cliente.getEmail());
        dto.setTelefono(cliente.getTelefono());
        dto.setCreatedAt(cliente.getCreatedAt());
        dto.setUpdatedAt(cliente.getUpdatedAt());
        dto.setRazonSocial(cliente.getRazonSocial());
        dto.setDireccion(cliente.getDireccion());
        dto.setActivo(cliente.getActivo());
        return dto;
    }
    }

