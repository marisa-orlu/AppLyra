package com.lyra.repository;

import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    //Busca libros cuyo título contenga la cadena indicada, ignorando mayúsculas y minúsculas
    @Query("SELECT l FROM Libro l WHERE LOWER(l.titulo_libro) LIKE LOWER(CONCAT('%', :titulo, '%'))")
    List<Libro> findByTituloLibroContainingIgnoreCase(@Param("titulo") String titulo);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Libro l WHERE LOWER(l.titulo_libro) = LOWER(:titulo) AND LOWER(l.autor) = LOWER(:autor)")
    boolean existsByTituloYAutorIgnoreCase(@Param("titulo") String titulo, @Param("autor") String autor);

    // Busca libros cuyo autor contenga la cadena indicada, ignorando mayúsculas y minúsculas
    List<Libro> findByAutorContainingIgnoreCase(String autor);

    // Busca libros que pertenezcan al género indicado, ignorando mayúsculas y minúsculas
    List<Libro> findByGeneroIgnoreCase(String genero);

    // Busca libros publicados en el año indicado.
    @Query("SELECT l FROM Libro l WHERE l.anio_publicacion = :anio")
    List<Libro> findByAnio(@Param("anio") Integer anio);
}
