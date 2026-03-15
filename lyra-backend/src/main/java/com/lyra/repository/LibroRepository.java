package com.lyra.repository;

import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    List<Libro> findByTituloLibroContainingIgnoreCase(String titulo);

    List<Libro> findByAutorContainingIgnoreCase(String autor);

    List<Libro> findByGeneroIgnoreCase(String genero);

    List<Libro> findByAnioPublicacion(Integer anioPublicacion);
}
