package com.backend.qualititrack.Service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockMultipartFile;

import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.modelos.Adjunto;
import com.backend.qualititrack.modelos.Solicitud;
import com.backend.qualititrack.modelos.Usuario;
import com.backend.qualititrack.repository.AdjuntoRepository;
import com.backend.qualititrack.repository.SolicitudRepository;
import com.backend.qualititrack.repository.UsuarioRepository;

// #257: validación de formato de adjuntos (sin base de datos, con mocks)
class AdjuntoServiceTest {

    private AdjuntoRepository adjuntoRepository;
    private AdjuntoService adjuntoService;

    @BeforeEach
    void setUp() {
        adjuntoRepository = mock(AdjuntoRepository.class);
        SolicitudRepository solicitudRepository = mock(SolicitudRepository.class);
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
        adjuntoService = new AdjuntoService(adjuntoRepository, solicitudRepository, usuarioRepository);

        Solicitud solicitud = new Solicitud();
        solicitud.setId(1L);
        Usuario vendedor = new Usuario();
        vendedor.setId(2L);
        vendedor.setRol(NivelRol.VENDEDOR);

        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(usuarioRepository.findByEmail("vendedor@test.com")).thenReturn(Optional.of(vendedor));
        when(adjuntoRepository.save(any(Adjunto.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void subir(String nombre, String contentType) throws Exception {
        MockMultipartFile archivo = new MockMultipartFile("archivo", nombre, contentType, new byte[] { 1, 2, 3 });
        adjuntoService.guardar(archivo, 1L, Adjunto.TipoArchivo.values()[0], "vendedor@test.com");
    }

    @ParameterizedTest
    @CsvSource({
            "plano.pdf, application/pdf",
            "foto.JPG, image/jpeg",
            "foto.png, image/png",
            "plano.dwg, application/octet-stream",
            "plano.dxf, ''",
            "plano.dxf, text/plain",
            "plano.dwg, application/x-dwg",
            "planilla.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "informe.docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    })
    void aceptaFormatosPermitidos(String nombre, String contentType) {
        assertDoesNotThrow(() -> subir(nombre, contentType));
    }

    @ParameterizedTest
    @CsvSource({
            "virus.exe, application/x-msdownload",
            "script.bat, application/octet-stream",
            "script.sh, application/x-sh",
            "comprimido.zip, application/zip",
            "sin_extension, application/pdf",
            "virus.pdf, application/x-msdownload",
            "virus.dwg, application/x-msdownload"
    })
    void rechazaFormatosNoPermitidos(String nombre, String contentType) {
        assertThrows(IllegalArgumentException.class, () -> subir(nombre, contentType));
        verify(adjuntoRepository, never()).save(any());
    }
}