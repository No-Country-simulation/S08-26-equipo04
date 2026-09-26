package com.backend.qualititrack.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.qualititrack.DTO.AdjuntoResponseDTO;
import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.modelos.Adjunto;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.AdjuntoRepository;
import com.backend.qualititrack.repository.SolicitudRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

import com.backend.qualititrack.exception.EntityNotFoundException;

@Service
public class AdjuntoService {

    private final AdjuntoRepository adjuntoRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public AdjuntoService(
            AdjuntoRepository adjuntoRepository,
            SolicitudRepository solicitudRepository,
            UsuarioRepository usuarioRepository) {
        this.adjuntoRepository = adjuntoRepository;
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public AdjuntoResponseDTO guardar(
            MultipartFile archivo,
            Long solicitudId,
            Adjunto.TipoArchivo tipoArchivo,
            String emailUsuario) throws IOException {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo es obligatorio");
        }

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La solicitud con ID " + solicitudId + " no existe"));

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El usuario no existe"));

        if (usuario.getRol() != NivelRol.VENDEDOR) {
            throw new AccessDeniedException(
                    "Solo un usuario con rol VENDEDOR puede subir documentos");
        }

        if (tipoArchivo == null) {
            throw new IllegalArgumentException("El tipo de archivo es obligatorio");
        }

        String nombreOriginal = archivo.getOriginalFilename();

        Adjunto adjunto = Adjunto.builder()
                .solicitud(solicitud)
                .nombreOriginal(nombreOriginal)
                .tipoArchivo(tipoArchivo)
                .mimeType(archivo.getContentType() != null
                        ? archivo.getContentType()
                        : "application/octet-stream")
                .tamanioBytes(archivo.getSize())
                .rutaAlmacenamiento("bd") // la columna es NOT NULL; indica que está en la base
                .contenido(archivo.getBytes())
                .subidoPor(usuario)
                .build();

        Adjunto guardado = adjuntoRepository.save(adjunto);

        return convertirDTO(guardado);
    }

    public List<AdjuntoResponseDTO> listarPorSolicitud(Long solicitudId) {
        if (!solicitudRepository.existsById(solicitudId)) {
            throw new EntityNotFoundException("La solicitud con ID " + solicitudId + " no existe");
        }
        return adjuntoRepository.listarSinContenido(solicitudId);
    }

    /**
     * Obtiene un adjunto para visualizar, verificando que exista y que tenga contenido.
     *
     * @param id el ID del adjunto
     * @return el adjunto encontrado
     * @throws EntityNotFoundException si el adjunto no existe o no tiene contenido
     */
    public Adjunto obtenerParaVer(Long id) {
        Adjunto adjunto = adjuntoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Adjunto no encontrado con ID: " + id));
        if (adjunto.getContenido() == null) {
            // adjuntos viejos que quedaron en el disco de Render
            throw new EntityNotFoundException("El archivo ya no está disponible. Hay que volver a subirlo.");
        }
        return adjunto;
    }

    private AdjuntoResponseDTO convertirDTO(Adjunto adjunto) {

        return new AdjuntoResponseDTO(
                adjunto.getId(),
                adjunto.getSolicitud().getId(),
                adjunto.getNombreOriginal(),
                adjunto.getTipoArchivo(),
                adjunto.getMimeType(),
                adjunto.getTamanioBytes(),
                adjunto.getRutaAlmacenamiento(),
                adjunto.getSubidoPor().getId(),
                adjunto.getCreatedAt());
    }
}
