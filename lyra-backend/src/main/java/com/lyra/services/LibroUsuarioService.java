package com.lyra.services;

import com.lyra.DTOs.LibroUsuarioDTOs.LibroUsuarioTop5Dto;
import com.lyra.exception.OperacionNoPermitidaException;
import com.lyra.exception.RecursoNoEncontradoException;
import com.lyra.model.EstadoLibro;
import com.lyra.model.Libro;
import com.lyra.model.LibroUsuario;
import com.lyra.model.Usuario;
import com.lyra.repository.LibroRepository;
import com.lyra.repository.LibroUsuarioRepository;
import com.lyra.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroUsuarioService {

    private final LibroUsuarioRepository libroUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    // Añadir libro a la biblioteca del usuario
    public LibroUsuario agregarLibro(Long idUsuario, Long idLibro, String estado) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        // Evitar duplicados
        libroUsuarioRepository.findByUsuarioAndLibro(usuario, libro)
                .ifPresent(lu -> {
                    throw new RuntimeException("Este libro ya está en la biblioteca del usuario");
                });

        LibroUsuario nuevo = LibroUsuario.builder()
                .usuario(usuario)
                .libro(libro)
                .estado(EstadoLibro.PENDIENTE)
                .fecha_agregacion(new Date())
                .isPrestamo(false)
                .puntuacion(null)
                .build();

        return libroUsuarioRepository.save(nuevo);
    }

    // Cambiar estado (leído, leyendo, pendiente)
    public LibroUsuario cambiarEstado(Long idLibroUsuario, Integer nuevoEstado) {
        LibroUsuario lu = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        EstadoLibro estado = EstadoLibro.fromValor(nuevoEstado);

        lu.setEstado(estado);
        return libroUsuarioRepository.save(lu);
    }


    public LibroUsuario editarLibroUsuario(Long idLibroUsuario, Integer estado, Boolean isPrestamo, Integer puntuacion) {
        LibroUsuario libroUsuario = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("LibroUsuario no encontrado con id: " + idLibroUsuario));

        if (estado != null) {
            libroUsuario.setEstado(EstadoLibro.fromValor(estado));
        }

        if (isPrestamo != null) {
            libroUsuario.setIsPrestamo(isPrestamo);
        }

        if (puntuacion != null) {
            if (puntuacion < 0 || puntuacion > 5) {
                throw new OperacionNoPermitidaException("La puntuacion debe estar entre 0 y 5");
            }
            libroUsuario.setPuntuacion(puntuacion);
        }

        return libroUsuarioRepository.save(libroUsuario);
    }


    // Añadir o actualizar puntuación
    public LibroUsuario puntuarLibro(Long idLibroUsuario, Integer puntuacion) {
        LibroUsuario lu = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        lu.setPuntuacion(puntuacion);
        return libroUsuarioRepository.save(lu);
    }

    // Marcar como préstamo
    public LibroUsuario marcarComoPrestamo(Long idLibroUsuario, boolean prestamo) {
        LibroUsuario lu = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        lu.setIsPrestamo(prestamo);
        return libroUsuarioRepository.save(lu);
    }

    // Obtener todos los libros de un usuario
    public List<LibroUsuario> obtenerBiblioteca(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return libroUsuarioRepository.findByUsuario(usuario);
    }

    // Top libros mejor puntuados del usuario
    public List<LibroUsuario> topPuntuados(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return libroUsuarioRepository.findByUsuarioOrderByPuntuacionDesc(usuario);
    }

    @Transactional
    public void eliminar(Long idLibroUsuario) {
        LibroUsuario lu = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("LibroUsuario no encontrado con id: " + idLibroUsuario));
        libroUsuarioRepository.delete(lu);
    }

    @Transactional
    public void eliminarPorUsuarioYLibro(Long idUsuario, Long idLibro) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RecursoNoEncontradoException("Libro no encontrado"));

        LibroUsuario lu = libroUsuarioRepository.findByUsuarioAndLibro(usuario, libro)
                .orElseThrow(() -> new RecursoNoEncontradoException("LibroUsuario no encontrado para ese usuario y libro"));

        libroUsuarioRepository.delete(lu);
    }

    public List<LibroUsuarioTop5Dto> top5ByUsuario(Long idUsuario) {
        Pageable pageable = PageRequest.of(0, 5);
        return libroUsuarioRepository.top5ByUsuario(idUsuario, pageable).stream()
                .map(lu -> new LibroUsuarioTop5Dto(
                        lu.getId_libro_usuario(),
                        lu.getUsuario().getId(),
                        lu.getLibro().getIdLibro(),
                        lu.getPuntuacion(),
                        lu.getLibro().getTitulo_libro(),
                        lu.getLibro().getAutor(),
                        lu.getLibro().getGenero(),
                        lu.getLibro().getPortada()
                ))
                .toList();
    }

}
