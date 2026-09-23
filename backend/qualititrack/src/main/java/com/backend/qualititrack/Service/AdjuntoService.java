package com.backend.qualititrack.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
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

import jakarta.persistence.EntityNotFoundException;

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

        Path directorio = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(directorio);

        String nombreOriginal = archivo.getOriginalFilename();

        if (nombreOriginal == null || nombreOriginal.isBlank()) {
            nombreOriginal = "archivo";
        }

        String nombreGuardado = UUID.randomUUID() + "_" + nombreOriginal;

        Path destino = directorio.resolve(nombreGuardado).normalize();

        if (!destino.startsWith(directorio)) {
            throw new IllegalArgumentException("Ruta de archivo inválida");
        }

        Files.copy(
                archivo.getInputStream(),
                destino,
                StandardCopyOption.REPLACE_EXISTING);

        Adjunto adjunto = Adjunto.builder()
                .solicitud(solicitud)
                .nombreOriginal(nombreOriginal)
                .tipoArchivo(tipoArchivo)
                .mimeType(
                        archivo.getContentType() != null
                                ? archivo.getContentType()
                                : "application/octet-stream")
                .tamanioBytes(archivo.getSize())
                .rutaAlmacenamiento(destino.toString())
                .subidoPor(usuario)
                .build();

        Adjunto guardado = adjuntoRepository.save(adjunto);

        return convertirDTO(guardado);
    }

    public List<AdjuntoResponseDTO> listarPorSolicitud(Long solicitudId) {

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "La solicitud con ID " + solicitudId + " no existe"));

        return adjuntoRepository
                .findBySolicitudOrderByCreatedAtDesc(solicitud)
                .stream()
                .map(this::convertirDTO)
                .collect(Collectors.toList());
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
