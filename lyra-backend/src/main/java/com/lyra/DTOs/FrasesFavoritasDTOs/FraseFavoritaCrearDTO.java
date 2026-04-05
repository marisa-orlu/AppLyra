package com.lyra.DTOs.FrasesFavoritasDTOs;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// FraseFavoritaCrearDTO
public record FraseFavoritaCrearDTO(
        @NotNull(message = "El usuario es obligatorio")
        Long idUsuario,

        @NotNull(message = "El libro es obligatorio")
        Long idLibro,

        @NotBlank(message = "El contenido no puede estar vacío")
        @Size(max = 1000, message = "La frase no puede superar los 1000 caracteres")
        String contenido,

        @Min(value = 1, message = "La página debe ser mayor que 0")
        Integer pagina
) {}
