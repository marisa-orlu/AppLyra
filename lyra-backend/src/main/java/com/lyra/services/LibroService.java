package com.lyra.services;

import com.lyra.DTOs.LibroDTOs.LibroCrearDTO;
import com.lyra.DTOs.LibroDTOs.LibroDTO;
import com.lyra.exception.RecursoNoEncontradoException;
import com.lyra.model.FileMetadata;
import com.lyra.model.Libro;
import com.lyra.repository.LibroRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.lyra.services.StorageService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;
    private final StorageService storageService;


    // Crear libro
    public Libro crearLibro(LibroCrearDTO dto, MultipartFile file) {

        FileMetadata fileMetadata = storageService.store(file);

        Libro libro = Libro.builder()
                .titulo_libro(dto.titulo())
                .autor(dto.autor())
                .genero(dto.genero())
                .anio_publicacion(dto.anio_publicacion())
                .sinopsis(dto.sinopsis())
                .portada(fileMetadata.getFilename())   // Guardamos el nombre del archivo
                .build();

        return libroRepository.save(libro);
    }



    // Obtener libro por ID
    public Libro obtenerPorId(Long id) {
        return libroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe un libro con id: " + id));
    }

    // Obtener todos los libros
    public Page<Libro> obtenerTodos(Pageable pageable) {
        return libroRepository.findAll(pageable);
    }

    // Actualizar libro
    public Libro actualizarLibro(Long id, LibroDTO dto) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Libro no encontrado con id: " + id));

        // Solo pisa si viene valor
        if (dto.titulo() != null && !dto.titulo().isBlank()) {
            libro.setTitulo_libro(dto.titulo());
        }
        if (dto.autor() != null) {
            libro.setAutor(dto.autor());
        }
        if (dto.genero() != null) {
            libro.setGenero(dto.genero());
        }
        if (dto.anio_publicacion() != null) {
            libro.setAnio_publicacion(dto.anio_publicacion());
        }
        if (dto.sinopsis() != null) {
            libro.setSinopsis(dto.sinopsis());
        }
        if (dto.portada() != null) {
            libro.setPortada(dto.portada());
        }

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
