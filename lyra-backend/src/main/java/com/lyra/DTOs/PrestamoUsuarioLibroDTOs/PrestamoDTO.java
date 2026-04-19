package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import com.lyra.model.EstadoPrestamo;
import com.lyra.model.PrestamoUsuarioLibro;

import java.util.Date;

public record PrestamoDTO(
        Long id,
        Long idUsuario,
        Long id_libro,
        Date fechaInicio,
        Date fechaFin,
        EstadoPrestamo estado
) {

    public static PrestamoDTO of(PrestamoUsuarioLibro p) {
        return new PrestamoDTO(
                p.getId_prestamo(),
                p.getUsuario().getId(),
                p.getLibro().getIdLibro(),
                p.getFecha_inicio(),
                p.getFecha_fin(),
                p.getEstado()
        );
    }
}


