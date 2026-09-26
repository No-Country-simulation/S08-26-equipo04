package com.qualitytrack.Service;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.qualitytrack.modelos.Usuario;
import com.qualitytrack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Spring Security llama este método al intentar autenticar
     * Buscamos el usuario por EMAIL (que es el "username" en nuestro caso)
     */
    /*@Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("🔍 CustomUserDetailsService.loadUserByUsername()");
        System.out.println("📧 Email: " + email);
        System.out.println("👤 Usuario encontrado: " + usuario.getNombre());
        System.out.println("🔐 Rol: " + usuario.getRol());
        System.out.println("═══════════════════════════════════════════════════════════");

        // Crear autoridades basadas en el rol
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));

        System.out.println("✅ Authorities asignadas: " + authorities);*/

  /*  @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("🔍 CustomUserDetailsService.loadUserByUsername()");
        System.out.println("📧 Email: " + email);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        System.out.println("👤 Usuario encontrado: " + usuario.getNombre());
        System.out.println("🔐 Rol: " + usuario.getRol());
        System.out.println("🔑 Password hash from DB: " + usuario.getPasswordHash());
        System.out.println("🔑 Hash length: " + usuario.getPasswordHash().length());
        System.out.println("🔑 Hash starts with: " + usuario.getPasswordHash().substring(0, Math.min(10, usuario.getPasswordHash().length())));

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));

        System.out.println("✅ Authorities asignadas: " + authorities);

        /*return new User(
                usuario.getEmail(),
                usuario.getPasswordHash(),  // password_hash de BD
                usuario.getActivo(),     // enabled
                true,                     // accountNonExpired
                true,                     // credentialsNonExpired
                true,                     // accountNonLocked
                authorities
        );*/
        /*return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!usuario.getActivo())
                .build();
        return new User(
                usuario.getEmail(),
                usuario.getPasswordHash(),
                usuario.getActivo(),
                true, true, true,
                authorities
        );
    }*/
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("[DEBUG] Buscando usuario con email: '" + email + "' - longitud: " + email.length());

        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);

        System.out.println("[DEBUG] Resultado de findByEmail: " + (usuario.isPresent() ? "ENCONTRADO" : "NO ENCONTRADO"));

        if (usuario.isEmpty()) {
            System.out.println("[DEBUG] Ejecutando SELECT directo como fallback...");
            // Test directo - comenta después
            throw new UsernameNotFoundException("Usuario no encontrado: " + email);
        }

        Usuario u = usuario.get();
        System.out.println("[DEBUG] Usuario encontrado: " + u.getEmail() + " | Rol: " + u.getRol() + " | Activo: " + u.getActivo());
        return new User(u.getEmail(), u.getPasswordHash(),
                AuthorityUtils.createAuthorityList("ROLE_" + u.getRol().name()));
    }
}




