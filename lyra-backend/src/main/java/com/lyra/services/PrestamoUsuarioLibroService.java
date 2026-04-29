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

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrestamoUsuarioLibroService {

    private final PrestamoUsuarioLibroRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    public PrestamoUsuarioLibro crearPrestamo(Long idDuenio, Long idSolicitante, Long idLibro) {

        Usuario duenio = usuarioRepository.findById(idDuenio)
                .orElseThrow(() -> new RuntimeException("Dueño no encontrado"));

        Usuario solicitante = usuarioRepository.findById(idSolicitante)
                .orElseThrow(() -> new RuntimeException("Solicitante no encontrado"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        PrestamoUsuarioLibro prestamo = PrestamoUsuarioLibro.builder()
                .duenio(duenio)
                .solicitante(solicitante)
                .libro(libro)
                .fecha_inicio(LocalDate.now())
                .estado(EstadoPrestamo.PENDIENTE)
                .build();

        return prestamoRepository.save(prestamo);
    }

    public PrestamoUsuarioLibro obtenerPorId(Long id) {
        return prestamoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
    }

    public PrestamoUsuarioLibro cambiarEstado(Long idPrestamo, Integer nuevoEstado) {
        PrestamoUsuarioLibro prestamo = obtenerPorId(idPrestamo);

        EstadoPrestamo estado = EstadoPrestamo.fromValor(nuevoEstado);
        prestamo.setEstado(estado);

        if (estado == EstadoPrestamo.DEVUELTO) {
            prestamo.setFecha_fin(LocalDate.now());
        }

        return prestamoRepository.save(prestamo);
    }

    public PrestamoUsuarioLibro aceptarPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.ACEPTADO.getValor());
    }

    public PrestamoUsuarioLibro rechazarPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.RECHAZADO.getValor());
    }

    public PrestamoUsuarioLibro devolverPrestamo(Long idPrestamo) {
        return cambiarEstado(idPrestamo, EstadoPrestamo.DEVUELTO.getValor());
    }

    public List<PrestamoUsuarioLibro> obtenerPorDuenio(Long idDuenio) {
        return prestamoRepository.findByDuenio_Id(idDuenio);
    }

    public List<PrestamoUsuarioLibro> obtenerPorSolicitante(Long idSolicitante) {
        return prestamoRepository.findBySolicitante_Id(idSolicitante);
    }

    public List<PrestamoUsuarioLibro> obtenerPorLibro(Long idLibro) {
        return prestamoRepository.findByLibro_IdLibro(idLibro);
    }
}
