package com.lyra.DTOs.LibroUsuarioDTOs;

public record LibroUsuarioTop5Dto(
        Long idLibroUsuario,
        Long idUsuario,
        Long idLibro,
        Integer puntuacion,
        String titulo,
        String autor,
        String genero,
        String portada
) {}