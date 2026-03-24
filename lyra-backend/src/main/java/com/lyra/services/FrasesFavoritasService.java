package com.lyra.services;

import com.lyra.model.FrasesFavoritas;
import com.lyra.model.Libro;
import com.lyra.model.Usuario;
import com.lyra.repository.FrasesFavoritasRepository;
import com.lyra.repository.LibroRepository;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FrasesFavoritasService {

    private final FrasesFavoritasRepository frasesFavoritasRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    // Crear frase favorita
    public FrasesFavoritas crearFrase(Long idUsuario, Long idLibro, String contenido, Integer pagina) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        FrasesFavoritas frase = FrasesFavoritas.builder()
                .usuario(usuario)
                .libro(libro)
                .contenido(contenido)
                .pagina(pagina)
                .fecha(new Date())
                .build();

        return frasesFavoritasRepository.save(frase);
    }

    // Obtener frase por ID
    public FrasesFavoritas obtenerPorId(Long id) {
        return frasesFavoritasRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Frase no encontrada"));
    }

    // Editar frase favorita
    public FrasesFavoritas actualizarFrase(Long idFrase, String nuevoContenido, Integer nuevaPagina) {
        FrasesFavoritas frase = obtenerPorId(idFrase);

        frase.setContenido(nuevoContenido);
        frase.setPagina(nuevaPagina);

        return frasesFavoritasRepository.save(frase);
    }

    // Eliminar frase favorita
    public void eliminarFrase(Long idFrase) {
        FrasesFavoritas frase = obtenerPorId(idFrase);
        frasesFavoritasRepository.delete(frase);
    }

    // Obtener frases de un usuario
    public List<FrasesFavoritas> obtenerPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return frasesFavoritasRepository.findByUsuario(usuario);
    }

    // Obtener frases de un libro
    public List<FrasesFavoritas> obtenerPorLibro(Long idLibro) {
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        return frasesFavoritasRepository.findByLibro(libro);
    }
}
