package com.lyra.repository;

import com.lyra.model.PrestamoUsuarioLibro;
import com.lyra.model.Usuario;
import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrestamoUsuarioLibroRepository extends JpaRepository<PrestamoUsuarioLibro, Long> {

    List<PrestamoUsuarioLibro> findByUsuario(Usuario usuario);

    List<PrestamoUsuarioLibro> findByLibro(Libro libro);
}
