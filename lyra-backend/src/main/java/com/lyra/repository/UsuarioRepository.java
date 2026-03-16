package com.lyra.repository;

import com.lyra.model.Rol;
import com.lyra.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // 1. Fundamental para el Login
    Optional<Usuario> findByEmail(String email);

    // 2. Para validar si un nombre de usuario ya existe
    boolean existsByNombre(String nombre);

    // 3. Para validar si un email ya está registrado
    boolean existsByEmail(String email);

    // 4. Buscar usuarios por su rol (ADMIN o USER)
    List<Usuario> findByRol(Rol rol);

    // 5. Opcional: Buscar por fragmento de nombre (para buscadores)
    List<Usuario> findByNombreContainingIgnoreCase(String nombre);
}
