package com.qualitytrack.Service;

import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Carga el usuario por email (username) para la autenticación de Spring Security.
 * Los usuarios inactivos no pueden iniciar sesión.
 */
@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        boolean activo = Boolean.TRUE.equals(usuario.getActivo());

        return new User(
                usuario.getEmail(),
                usuario.getPasswordHash(),
                activo,  // enabled
                true,    // accountNonExpired
                true,    // credentialsNonExpired
                true,    // accountNonLocked
                AuthorityUtils.createAuthorityList("ROLE_" + usuario.getRol().name())
        );
    }
}
