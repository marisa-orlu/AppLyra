package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Collection;


/**
 * Representa a un usuario registrado en la aplicación
 * Contiene información personal, credenciales, perfil y su rol (ADMIN o USER)
 * Mantiene relaciones con reseñas, frases favoritas, libros asociados y préstamos
 */


@Entity
@Table(name = "usuario")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Usuario implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "nombre_usuario", nullable = false)
    private String nombre;

    @Column(name = "email_usuario", nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", nullable = false)
    private String contrasena;

    @Column (name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @Column(name = "biografia_usuario")
    private String biografia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol = Rol.USER;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Resena> resenas;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<FrasesFavoritas> frases;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<LibroUsuario> librosUsuario;

    @OneToMany(mappedBy = "duenio")
    private List<PrestamoUsuarioLibro> prestamosComoDuenio;

    @OneToMany(mappedBy = "solicitante")
    private List<PrestamoUsuarioLibro> prestamosComoSolicitante;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}

