package com.lyra.repository;

import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    //Busca libros cuyo título contenga la cadena indicada, ignorando mayúsculas y minúsculas
    @Query("SELECT l FROM Libro l WHERE l.titulo_libro = :titulo")
    List<Libro> findByTituloLibroContainingIgnoreCase(String titulo);

    // Busca libros cuyo autor contenga la cadena indicada, ignorando mayúsculas y minúsculas
    List<Libro> findByAutorContainingIgnoreCase(String autor);

    // Busca libros que pertenezcan al género indicado, ignorando mayúsculas y minúsculas
    List<Libro> findByGeneroIgnoreCase(String genero);

    // Busca libros publicados en el año indicado.
    @Query("SELECT l FROM Libro l WHERE l.anio_publicacion = :anio")
    List<Libro> findByAnio(@Param("anio") Integer anio);
}
