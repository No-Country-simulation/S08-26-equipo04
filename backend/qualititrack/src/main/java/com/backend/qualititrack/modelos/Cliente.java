package com.backend.qualititrack.modelos;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre no puede estar vacio")
    @Column(nullable = false)
    private String nombre;

    @Email(message = "Email invalido")
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String telefono;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(
            mappedBy = "cliente",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Solicitud> solicitudes;

    @OneToMany(
            mappedBy = "cliente",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OrdenTrabajo> ordenesTrabajos;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }

   /* public Cliente(Long id, String nombre, String email, String telefono, LocalDateTime fechaCreacion, List<Solicitud> solicitudes, List<OrdenTrabajo> ordenesTrabajos) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.fechaCreacion = fechaCreacion;
        this.solicitudes = solicitudes;
        this.ordenesTrabajos = ordenesTrabajos;
    }*/


    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefono() {
        return telefono;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public List<Solicitud> getSolicitudes() {
        return solicitudes;
    }

    public List<OrdenTrabajo> getOrdenesTrabajos() {
        return ordenesTrabajos;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void setOrdenesTrabajos(List<OrdenTrabajo> ordenesTrabajos) {
        this.ordenesTrabajos = ordenesTrabajos;
    }

    public void setSolicitudes(List<Solicitud> solicitudes) {
        this.solicitudes = solicitudes;
    }
}
