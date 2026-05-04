package com.lyra.repository;

import com.lyra.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrestamoUsuarioLibroRepository extends JpaRepository<PrestamoUsuarioLibro, Long> {

    List<PrestamoUsuarioLibro> findByDuenio(Usuario duenio);

    List<PrestamoUsuarioLibro> findBySolicitante(Usuario solicitante);

    List<PrestamoUsuarioLibro> findByDuenio_Id(Long idDuenio);

    List<PrestamoUsuarioLibro> findBySolicitante_Id(Long idSolicitante);

    List<PrestamoUsuarioLibro> findByLibro(Libro libro);

    List<PrestamoUsuarioLibro> findByLibro_IdLibro(Long idLibro);

    List<PrestamoUsuarioLibro> findByEstado(EstadoPrestamo estado);
}
