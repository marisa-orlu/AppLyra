package com.lyra.repository;

import com.lyra.model.Resena;
import com.lyra.model.Usuario;
import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

    List<Resena> findByUsuario(Usuario usuario);

    List<Resena> findByLibro(Libro libro);
}

