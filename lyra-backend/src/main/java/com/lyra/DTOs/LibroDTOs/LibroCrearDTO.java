package com.lyra.DTOs.LibroDTOs;

public record LibroCrearDTO(
        String titulo,
        String autor,
        String genero,
        Integer anio_publicacion,
        String sinopsis,
        String portada
) {}
