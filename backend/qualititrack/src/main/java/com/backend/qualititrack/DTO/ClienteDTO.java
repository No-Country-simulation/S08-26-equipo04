package com.backend.qualititrack.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank
    private String email;

    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
         this.email = email;
    }

    private String telefono;

    public String getTelefono() {
        return telefono;
    }
    public void setTelefono(String telefono){
         this.telefono = telefono;
    }

    private String direccion;

    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion){
         this.direccion = direccion;
    }

    private Boolean activo;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaUltimaActualizacion;

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public LocalDateTime getFechaUltimaActualizacion() {
        return fechaUltimaActualizacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void setFechaUltimaActualizacion(LocalDateTime fechaUltimaActualizacion) {
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
    }


    /*public ClienteDTO(LocalDateTime fechaCreacion, String direccion, Boolean activo, String telefono, String email, String nombre, LocalDateTime fechaUltimaActualizacion) {
        this.fechaCreacion = fechaCreacion;
        this.direccion = direccion;
        this.activo = activo;
        this.telefono = telefono;
        this.email = email;
        this.nombre = nombre;
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
    }*/
}
