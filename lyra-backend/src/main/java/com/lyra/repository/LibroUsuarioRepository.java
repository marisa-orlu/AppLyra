package com.lyra.repository;

import com.lyra.model.LibroUsuario;
import com.lyra.model.Usuario;
import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LibroUsuarioRepository extends JpaRepository<LibroUsuario, Long> {

    List<LibroUsuario> findByUsuario(Usuario usuario);

    Optional<LibroUsuario> findByUsuarioAndLibro(Usuario usuario, Libro libro);

    List<LibroUsuario> findByUsuarioOrderByPuntuacionDesc(Usuario usuario);
}
