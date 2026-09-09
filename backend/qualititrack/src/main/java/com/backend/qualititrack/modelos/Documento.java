package com.backend.qualititrack.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "La URL del archivo no puede estar vacía")
    @Column(name = "archivo_url", nullable = false, length = 500)
    private String archivoUrl;

    @Column(name = "nombre_archivo", length = 200)
    private String nombreArchivo;

    @Column(name = "tamaño_bytes")
    private Long tamañoBytes;

    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;

    @Column(name = "fecha_carga", nullable = false, updatable = false)
    private LocalDateTime fechaCarga;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_trabajo_id", nullable = false)
    private OrdenTrabajo ordenTrabajo;

    @PrePersist
    protected void onCreate() {
        fechaCarga = LocalDateTime.now();
    }

}
