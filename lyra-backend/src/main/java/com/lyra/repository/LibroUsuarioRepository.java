package com.lyra.repository;

import com.lyra.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

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

    @Query("""
    select lu
    from LibroUsuario lu
    join fetch lu.libro l
    where lu.usuario.id = :idUsuario
    order by lu.puntuacion desc
""")
    List<LibroUsuario> top5ByUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);



}
