package com.lyra.repository;

import com.lyra.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LibroUsuarioRepository extends JpaRepository<LibroUsuario, Long> {

    List<LibroUsuario> findByUsuario(Usuario usuario);

    Optional<LibroUsuario> findByUsuarioAndLibro(Usuario usuario, Libro libro);

    List<LibroUsuario> findByUsuarioOrderByPuntuacionDesc(Usuario usuario);

    List<LibroUsuario> findByLibro_IdLibro(Long idLibro);

    List<LibroUsuario> findByEstado(EstadoLibro estado);

}
