package com.lyra.DTOs.ResenaDTOs;

import com.lyra.model.Resena;

import java.util.Date;

public record ResenaDTO(
        Long id,
        Long idUsuario,
        Long idLibro,
        String texto,
        Integer puntuacion,
        Date fechaPublicacion
) {

    public static ResenaDTO of(Resena r) {
        return new ResenaDTO(
                r.getId_resena(),
                r.getUsuario().getId(),
                r.getLibro().getIdLibro(),
                r.getTexto(),
                r.getPuntuacion(),
                r.getFecha_publicacion()
        );
    }
}
