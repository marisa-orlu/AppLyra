package com.lyra.services;

import com.lyra.DTOs.LibroDTOs.LibroCrearDTO;
import com.lyra.DTOs.LibroDTOs.LibroDTO;
import com.lyra.exception.LibroYaExisteException;
import com.lyra.exception.OperacionNoPermitidaException;
import com.lyra.exception.RecursoNoEncontradoException;
import com.lyra.model.FileMetadata;
import com.lyra.model.Libro;
import com.lyra.model.Usuario;
import com.lyra.repository.LibroRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;
    private final StorageService storageService;


    // Crear libro
    public Libro crearLibro(LibroCrearDTO dto, MultipartFile file, Usuario usuarioAutenticado) {
        String tituloNormalizado = dto.titulo() == null ? "" : dto.titulo().trim();
        String autorNormalizado = dto.autor() == null ? "" : dto.autor().trim();

        if (!tituloNormalizado.isBlank() && !autorNormalizado.isBlank()
            && libroRepository.existsByTituloYAutorIgnoreCase(tituloNormalizado, autorNormalizado)) {
            throw new LibroYaExisteException("Ya existe un libro con ese título y autor");
        }

        FileMetadata fileMetadata = (file != null && !file.isEmpty()) ? storageService.store(file) : null;

        Libro libro = Libro.builder()
            .titulo_libro(tituloNormalizado)
            .autor(autorNormalizado)
                .genero(dto.genero())
                .anio_publicacion(dto.anio_publicacion())
                .sinopsis(dto.sinopsis())
                .portada(fileMetadata != null ? fileMetadata.getFilename() : null)
                .build();

        libro.setUsuarioCreador(usuarioAutenticado);
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
    public Libro actualizarLibro(Long id, LibroDTO dto, Usuario usuarioAutenticado) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Libro no encontrado"));

        if (usuarioAutenticado == null || usuarioAutenticado.getId() == null) {
            throw new OperacionNoPermitidaException("Usuario no autenticado");
        }

        if (libro.getUsuarioCreador() == null || libro.getUsuarioCreador().getId() == null) {
            throw new OperacionNoPermitidaException("El libro no tiene usuario creador asignado");
        }

        if (!esCreador(libro, usuarioAutenticado) && !esAdmin(usuarioAutenticado)) {
            throw new OperacionNoPermitidaException("No tienes permisos para editar este libro");
        }


        if (dto.titulo() != null && !dto.titulo().isBlank()) libro.setTitulo_libro(dto.titulo());
        if (dto.autor() != null) libro.setAutor(dto.autor());
        if (dto.genero() != null) libro.setGenero(dto.genero());
        if (dto.anio_publicacion() != null) libro.setAnio_publicacion(dto.anio_publicacion());
        if (dto.sinopsis() != null) libro.setSinopsis(dto.sinopsis());
        if (dto.portada() != null) libro.setPortada(dto.portada());

        return libroRepository.save(libro);
    }

    private boolean esAdmin(Usuario usuario) {
        return usuario != null
                && usuario.getRol() != null
                && "ADMIN".equalsIgnoreCase(usuario.getRol().name()); // o toString() según tu enum
    }

    private boolean esCreador(Libro libro, Usuario usuario) {
        return libro != null
                && libro.getUsuarioCreador() != null
                && libro.getUsuarioCreador().getId() != null
                && usuario != null
                && usuario.getId() != null
                && libro.getUsuarioCreador().getId().equals(usuario.getId());
    }

    // Eliminar libro
    public void eliminarLibro(Long id, Usuario usuarioAutenticado) {
        Libro libro = obtenerPorId(id);

        if (usuarioAutenticado == null || usuarioAutenticado.getId() == null) {
            throw new OperacionNoPermitidaException("Usuario no autenticado");
        }

        if (libro.getUsuarioCreador() == null || libro.getUsuarioCreador().getId() == null) {
            throw new OperacionNoPermitidaException("El libro no tiene usuario creador asignado");
        }

        if (!libro.getUsuarioCreador().getId().equals(usuarioAutenticado.getId())) {
            throw new OperacionNoPermitidaException("No puedes eliminar un libro que no has creado");
        }

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
