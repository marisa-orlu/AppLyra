package com.lyra.services;

import com.lyra.model.EstadoPrestamo;
import com.lyra.model.Libro;
import com.lyra.model.PrestamoUsuarioLibro;
import com.lyra.model.Usuario;
import com.lyra.repository.LibroRepository;
import com.lyra.repository.PrestamoUsuarioLibroRepository;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrestamoUsuarioLibroService {

    private final PrestamoUsuarioLibroRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    // Crear un préstamo (estado inicial: pendiente)
    public PrestamoUsuarioLibro crearPrestamo(Long idUsuario, Long id_libro) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Libro libro = libroRepository.findById(id_libro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        PrestamoUsuarioLibro prestamo = PrestamoUsuarioLibro.builder()
                .usuario(usuario)
                .libro(libro)
                .fecha_inicio(new Date())
                .fecha_fin(null)
                .estado(EstadoPrestamo.PENDIENTE)
                .build();

        return prestamoRepository.save(prestamo);
    }

    // Obtener préstamo por ID
    public PrestamoUsuarioLibro obtenerPorId(Long id) {
        return prestamoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
    }

    // Cambiar estado del préstamo
    public PrestamoUsuarioLibro cambiarEstado(Long idPrestamo, Integer nuevoEstado) {
        PrestamoUsuarioLibro prestamo = obtenerPorId(idPrestamo);

        EstadoPrestamo estado = EstadoPrestamo.fromValor(nuevoEstado);

        prestamo.setEstado(estado);

        // Si se marca como devuelto, se establece fecha_fin
        if (EstadoPrestamo.DEVUELTO.name().equalsIgnoreCase(estado.name())) {
            prestamo.setFecha_fin(new Date());
        }

        return prestamoRepository.save(prestamo);
    }

    // Aceptar préstamo
    public PrestamoUsuarioLibro aceptarPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.ACEPTADO.getValor());
    }

    // Rechazar préstamo
    public PrestamoUsuarioLibro rechazarPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.RECHAZADO.getValor());
    }

    // Marcar como devuelto
    public PrestamoUsuarioLibro devolverPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.DEVUELTO.getValor());
    }

    // Obtener préstamos de un usuario
    public List<PrestamoUsuarioLibro> obtenerPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return prestamoRepository.findByUsuario(usuario);
    }

    // Obtener préstamos de un libro
    public List<PrestamoUsuarioLibro> obtenerPorLibro(Long id_libro) {
        Libro libro = libroRepository.findById(id_libro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        return prestamoRepository.findByLibro(libro);
    }
}
