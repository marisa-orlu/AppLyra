package com.lyra.DTOs.LibroDTOs;

public record LibroCrearDTO(
        String titulo,
        String autor,
        String genero,
        Integer anioPublicacion,
        String sinopsis,
        String portada
) {}
