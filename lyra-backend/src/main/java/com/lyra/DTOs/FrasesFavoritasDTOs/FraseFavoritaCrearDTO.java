package com.lyra.DTOs.FrasesFavoritasDTOs;

public record FraseFavoritaCrearDTO(
        Long idUsuario,
        Long idLibro,
        String contenido,
        Integer pagina
) {}

