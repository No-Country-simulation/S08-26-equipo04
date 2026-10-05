package com.backend.qualititrack.Service;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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

        // Formatos permitidos (#257 / QA #254). Misma lista que el frontend
    // (frontend/src/utils/adjuntos.js): para cada extensión, los Content-Type
    // aceptados.
    private static final Map<String, Set<String>> FORMATOS_PERMITIDOS = Map.ofEntries(
            Map.entry(".pdf", Set.of("application/pdf")),
            Map.entry(".doc", Set.of("application/msword")),
            Map.entry(".docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry(".png", Set.of("image/png")),
            Map.entry(".jpg", Set.of("image/jpeg")),
            Map.entry(".jpeg", Set.of("image/jpeg")),
            Map.entry(".dwg", Set.of("image/vnd.dwg", "image/x-dwg", "application/acad", "application/dwg",
                    "application/x-dwg", "application/x-acad", "application/autocad_dwg", "drawing/x-dwg")),
            Map.entry(".dxf", Set.of("image/vnd.dxf", "image/x-dxf", "application/dxf", "application/x-dxf",
                    "text/plain")), // el DXF es texto: algunos sistemas lo mandan como text/plain
            Map.entry(".xls", Set.of("application/vnd.ms-excel")),
            Map.entry(".xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));

    // Algunos navegadores mandan un Content-Type genérico (sobre todo en CAD):
    // en ese caso decide la extensión.
    private static final Set<String> MIME_GENERICOS = Set.of("", "application/octet-stream");

    private static final String MENSAJE_NO_PERMITIDO =
            "Tipo de archivo no permitido. Extensiones válidas: .pdf, .png, .jpg, .jpeg, .dwg, .dxf, .doc, .docx, .xls, .xlsx";

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
        validarFormato(archivo);

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

        // Rechaza el archivo si la extensión no está permitida o si el Content-Type
    // no corresponde a esa extensión (ej. un .exe renombrado a .pdf).
    private void validarFormato(MultipartFile archivo) {
        String nombre = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "";
        int punto = nombre.lastIndexOf('.');
        String extension = punto >= 0 ? nombre.substring(punto).toLowerCase(Locale.ROOT) : "";

        Set<String> mimesValidos = FORMATOS_PERMITIDOS.get(extension);
        if (mimesValidos == null) {
            throw new IllegalArgumentException(MENSAJE_NO_PERMITIDO);
        }

        String mime = archivo.getContentType() != null
                ? archivo.getContentType().toLowerCase(Locale.ROOT).split(";")[0].trim()
                : "";
        if (!MIME_GENERICOS.contains(mime) && !mimesValidos.contains(mime)) {
            throw new IllegalArgumentException(MENSAJE_NO_PERMITIDO);
        }
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
