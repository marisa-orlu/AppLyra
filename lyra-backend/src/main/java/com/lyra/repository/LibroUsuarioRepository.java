package com.lyra.repository;

import com.lyra.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LibroUsuarioRepository extends JpaRepository<LibroUsuario, Long> {

    List<LibroUsuario> findByUsuario(Usuario usuario);

    Optional<LibroUsuario> findByUsuarioAndLibro(Usuario usuario, Libro libro);

    List<LibroUsuario> findByUsuarioOrderByPuntuacionDesc(Usuario usuario);

    List<LibroUsuario> findByLibro_IdLibro(Long idLibro);

    List<LibroUsuario> findByEstado(EstadoLibro estado);

    @Query("""
    select lu
    from LibroUsuario lu
    join fetch lu.libro l
    join fetch lu.usuario u
    where u.id = :idUsuario
""")
    List<LibroUsuario> findAllByIdUsuarioWithLibro(Long idUsuario);


}
