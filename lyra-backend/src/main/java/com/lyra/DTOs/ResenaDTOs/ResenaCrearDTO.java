package com.lyra.DTOs.ResenaDTOs;

import jakarta.validation.constraints.*;

// ResenaCrearDTO
public record ResenaCrearDTO(
        @NotNull(message = "El usuario es obligatorio")
        Long idUsuario,

        @NotNull(message = "El libro es obligatorio")
        Long idLibro,

        @NotBlank(message = "El texto no puede estar vacío")
        @Size(min = 10, message = "La reseña debe tener al menos 10 caracteres")
        String texto,

        @NotNull(message = "La puntuación es obligatoria")
        @Min(value = 1, message = "La puntuación mínima es 1")
        @Max(value = 5, message = "La puntuación máxima es 5")
        Integer puntuacion
) {}
