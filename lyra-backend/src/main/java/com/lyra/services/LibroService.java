package com.lyra.services;

import com.lyra.DTOs.LibroDTOs.LibroDTO;
import com.lyra.model.Libro;
import com.lyra.repository.LibroRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;

    // Crear libro
    public Libro crearLibro(LibroDTO dto) {

        Libro libro = Libro.builder()
                .titulo_libro(dto.titulo())
                .autor(dto.autor())
                .genero(dto.genero())
                .anio_publicacion(dto.anio_publicacion())
                .sinopsis(dto.sinopsis())
                .portada(dto.portada())
                .build();

        return libroRepository.save(libro);
    }

    // Obtener libro por ID
    public Libro obtenerPorId(Long id) {
        return libroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe un libro con id: " + id));
    }

    // Obtener todos los libros
    public List<Libro> obtenerTodos() {
        return libroRepository.findAll();
    }

    // Actualizar libro
    public Libro actualizarLibro(Long id, Libro datos) {
        Libro libro = obtenerPorId(id);

        libro.setTitulo_libro(datos.getTitulo_libro());
        libro.setAutor(datos.getAutor());
        libro.setGenero(datos.getGenero());
        libro.setAnio_publicacion(datos.getAnio_publicacion());
        libro.setSinopsis(datos.getSinopsis());
        libro.setPortada(datos.getPortada());

        return libroRepository.save(libro);
    }



    // Eliminar libro
    public void eliminarLibro(Long id) {
        Libro libro = obtenerPorId(id);
        libroRepository.delete(libro);
    }

    // Búsquedas
    public List<Libro> buscarPorTitulo(String titulo) {
        return libroRepository.findByTituloLibroContainingIgnoreCase(titulo);
    }

    public List<Libro> buscarPorAutor(String autor) {
        return libroRepository.findByAutorContainingIgnoreCase(autor);
    }

    public List<Libro> buscarPorGenero(String genero) {
        return libroRepository.findByGeneroIgnoreCase(genero);
    }

    public List<Libro> buscarPorAnio(Integer anio_publicacion) {
        return libroRepository.findByAnio(anio_publicacion);
    }
}
