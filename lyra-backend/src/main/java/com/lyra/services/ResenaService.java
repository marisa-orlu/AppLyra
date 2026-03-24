package com.lyra.services;

import com.lyra.model.Libro;
import com.lyra.model.Resena;
import com.lyra.model.Usuario;
import com.lyra.repository.LibroRepository;
import com.lyra.repository.ResenaRepository;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    // Crear reseña
    public Resena crearResena(Long idUsuario, Long idLibro, String texto, Integer puntuacion) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        Resena resena = Resena.builder()
                .usuario(usuario)
                .libro(libro)
                .texto(texto)
                .puntuacion(puntuacion)
                .fecha_publicacion(new Date())
                .build();

        return resenaRepository.save(resena);
    }

    // Obtener reseña por ID
    public Resena obtenerPorId(Long id) {
        return resenaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));
    }

    // Editar reseña
    public Resena actualizarResena(Long idResena, String nuevoTexto, Integer nuevaPuntuacion) {
        Resena resena = obtenerPorId(idResena);

        resena.setTexto(nuevoTexto);
        resena.setPuntuacion(nuevaPuntuacion);

        return resenaRepository.save(resena);
    }

    // Eliminar reseña
    public void eliminarResena(Long idResena) {
        Resena resena = obtenerPorId(idResena);
        resenaRepository.delete(resena);
    }

    // Obtener reseñas de un usuario
    public List<Resena> obtenerPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return resenaRepository.findByUsuario(usuario);
    }

    // Obtener reseñas de un libro
    public List<Resena> obtenerPorLibro(Long idLibro) {
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        return resenaRepository.findByLibro(libro);
    }
}
