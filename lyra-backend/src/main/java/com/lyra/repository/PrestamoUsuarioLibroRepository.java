package com.lyra.repository;

import com.lyra.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrestamoUsuarioLibroRepository extends JpaRepository<PrestamoUsuarioLibro, Long> {

    List<PrestamoUsuarioLibro> findByUsuario(Usuario usuario);

    List<PrestamoUsuarioLibro> findByLibro(Libro libro);

    List<PrestamoUsuarioLibro> findByUsuario_Id(Long idUsuario);

    List<PrestamoUsuarioLibro> findByLibro_IdLibro(Long idLibro);

    List<PrestamoUsuarioLibro> findByEstado(EstadoPrestamo estado);

}


