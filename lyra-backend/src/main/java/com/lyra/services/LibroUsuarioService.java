package com.lyra.services;

import com.lyra.model.Libro;
import com.lyra.model.LibroUsuario;
import com.lyra.model.Usuario;
import com.lyra.repository.LibroRepository;
import com.lyra.repository.LibroUsuarioRepository;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
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
                .estado(estado)
                .fecha_agregacion(new Date())
                .is_prestamo(false)
                .puntuacion(null)
                .build();

        return libroUsuarioRepository.save(nuevo);
    }

    // Cambiar estado (leído, leyendo, pendiente)
    public LibroUsuario cambiarEstado(Long idLibroUsuario, String nuevoEstado) {
        LibroUsuario lu = libroUsuarioRepository.findById(idLibroUsuario)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        lu.setEstado(nuevoEstado);
        return libroUsuarioRepository.save(lu);
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

        lu.setIs_prestamo(prestamo);
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
}
