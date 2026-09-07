package com.backend.qualititrack.repository;

import com.backend.qualititrack.Enum.NivelRol;
import com.backend.qualititrack.modelos.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    /**
     * Buscar usuario por email.
     *
     * SELECT * FROM usuario WHERE email = ?
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Buscar usuarios activos por rol (ahora recibe NivelRol enum directamente).
     *
     * SELECT * FROM usuario WHERE rol = ? AND activo = true
     */
    List<Usuario> findByRolAndActivo(NivelRol rol, Boolean activo);

    /**
     * Contar usuarios por rol.
     *
     * SELECT COUNT(*) FROM usuario WHERE rol = ?
     */
    Long countByRol(NivelRol rol);

    /**
     * Buscar usuarios activos.
     *
     * SELECT * FROM usuario WHERE activo = true
     */
    List<Usuario> findByActivo(Boolean activo);

    /**
     * Contar usuarios totales activos.
     */
    Long countByActivo(Boolean activo);
}

