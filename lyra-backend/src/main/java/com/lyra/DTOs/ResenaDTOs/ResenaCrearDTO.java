package com.lyra.DTOs.ResenaDTOs;

public record ResenaCrearDTO(
        Long idUsuario,
        Long idLibro,
        String texto,
        Integer puntuacion
) {}
