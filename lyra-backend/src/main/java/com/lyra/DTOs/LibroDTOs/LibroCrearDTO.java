package com.lyra.DTOs.LibroDTOs;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LibroCrearDTO(
        @NotBlank(message = "El título no puede estar vacío")
        String titulo,

        @NotBlank(message = "El autor no puede estar vacío")
        String autor,

        @NotBlank(message = "El género no puede estar vacío")
        String genero,

        @NotNull(message = "El año de publicación es obligatorio")
        @Min(value = 1000, message = "El año de publicación no es válido")
        @Max(value = 3000, message = "El año de publicación no es válido")
        Integer anio_publicacion,
        String sinopsis,
        String portada
) {}
