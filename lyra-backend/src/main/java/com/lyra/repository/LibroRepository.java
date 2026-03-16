package com.lyra.repository;

import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    //Busca libros cuyo título contenga la cadena indicada, ignorando mayúsculas y minúsculas
    List<Libro> findByTituloLibroContainingIgnoreCase(String titulo);

    // Busca libros cuyo autor contenga la cadena indicada, ignorando mayúsculas y minúsculas
    List<Libro> findByAutorContainingIgnoreCase(String autor);

    // Busca libros que pertenezcan al género indicado, ignorando mayúsculas y minúsculas
    List<Libro> findByGeneroIgnoreCase(String genero);

    // Busca libros publicados en el año indicado.
    List<Libro> findByAnioPublicacion(Integer anioPublicacion);
}
