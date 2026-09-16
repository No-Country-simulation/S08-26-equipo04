package com.backend.qualititrack.modelos;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "razon_social", nullable = false, length = 150)
    private String razonSocial;

    @NotBlank(message = "El nombre no puede estar vacio")
    @Column(name = "contacto_nombre", nullable = false, length = 120)
    private String contactoNombre;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String telefono;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String direccion;


    @Email(message = "Email invalido")
    @Column(length = 150)
    private String email;

    @Column(nullable = false)
    private Boolean activo = true;


    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    // Se actualiza la fecha de modificación al hacer un UPDATE desde Java
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

}
