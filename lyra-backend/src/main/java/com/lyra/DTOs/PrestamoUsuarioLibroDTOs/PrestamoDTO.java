package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import com.lyra.model.PrestamoUsuarioLibro;

import java.util.Date;

public record PrestamoDTO(
        Long id,
        Long idUsuario,
        Long idLibro,
        Date fechaInicio,
        Date fechaFin,
        String estado
) {

    public static PrestamoDTO of(PrestamoUsuarioLibro p) {
        return new PrestamoDTO(
                p.getId_prestamo(),
                p.getUsuario().getId(),
                p.getLibro().getId_libro(),
                p.getFecha_inicio(),
                p.getFecha_fin(),
                p.getEstado()
        );
    }
}


