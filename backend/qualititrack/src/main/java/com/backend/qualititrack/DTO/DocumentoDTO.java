package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentoDTO {
    private Long id;

    @NotNull(message = "El ID de OT no puede ser nulo")
    private Long ordenTrabajoId;

    private String numeroOT;

    @NotNull(message = "El tipo de documento no puede ser nulo")
    private TipoDocumento tipo;

    @NotBlank(message = "La URL del archivo no puede estar vacía")
    private String archivoUrl;

    private String nombreArchivo;

    private Long tamañoBytes;

    private String tipoMime;

    private String descripcion;

    private LocalDateTime fechaCarga;
}
