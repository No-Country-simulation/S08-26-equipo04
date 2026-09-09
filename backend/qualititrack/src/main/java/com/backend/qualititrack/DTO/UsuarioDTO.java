package com.backend.qualititrack.DTO;

import com.backend.qualititrack.Enum.NivelRol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;


public class UsuarioDTO {
    // ==================== FIELDS ====================

    private Long id;

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email no puede estar vacío")
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacía")
    private String password;

    @NotNull(message = "El rol no puede ser nulo")
    private NivelRol rol;

    private Boolean activo;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaUltimaActividad;

    // ==================== CONSTRUCTORES ====================

    /**
     * Constructor sin argumentos (requerido por Spring)
     */
    public UsuarioDTO() {
    }

    /**
     * Constructor con todos los argumentos
     */
    public UsuarioDTO(Long id, String nombre, String email, String password, NivelRol rol,
                      Boolean activo, LocalDateTime fechaCreacion, LocalDateTime fechaUltimaActividad) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaUltimaActividad = fechaUltimaActividad;
    }

    // ==================== GETTERS ====================

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public NivelRol getRol() {
        return rol;
    }

    public Boolean getActivo() {
        return activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public LocalDateTime getFechaUltimaActividad() {
        return fechaUltimaActividad;
    }

    // ==================== SETTERS ====================

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRol(NivelRol rol) {
        this.rol = rol;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void setFechaUltimaActividad(LocalDateTime fechaUltimaActividad) {
        this.fechaUltimaActividad = fechaUltimaActividad;
    }
}