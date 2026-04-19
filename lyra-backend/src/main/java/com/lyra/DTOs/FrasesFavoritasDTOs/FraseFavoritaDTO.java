package com.lyra.DTOs.FrasesFavoritasDTOs;

import com.lyra.model.FrasesFavoritas;

import java.util.Date;

public record FraseFavoritaDTO(
        Long id,
        Long idUsuario,
        Long idLibro,
        String contenido,
        Integer pagina,
        Date fecha
) {

    public static FraseFavoritaDTO of(FrasesFavoritas f) {
        return new FraseFavoritaDTO(
                f.getId_frase(),
                f.getUsuario().getId(),
                f.getLibro().getIdLibro(),
                f.getContenido(),
                f.getPagina(),
                f.getFecha()
        );
    }
}

