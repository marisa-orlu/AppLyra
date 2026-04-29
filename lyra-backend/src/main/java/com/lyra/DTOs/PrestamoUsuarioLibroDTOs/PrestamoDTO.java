package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import com.lyra.model.EstadoPrestamo;
import com.lyra.model.PrestamoUsuarioLibro;

import java.time.LocalDate;

public record PrestamoDTO(
        Long id,
        Long idDuenio,
        Long idSolicitante,
        Long idLibro,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        EstadoPrestamo estado
) {

    public static PrestamoDTO of(PrestamoUsuarioLibro p) {
        return new PrestamoDTO(
                p.getId_prestamo(),
                p.getDuenio().getId(),
                p.getSolicitante().getId(),
                p.getLibro().getIdLibro(),
                p.getFecha_inicio(),
                p.getFecha_fin(),
                p.getEstado()
        );
    }
}
