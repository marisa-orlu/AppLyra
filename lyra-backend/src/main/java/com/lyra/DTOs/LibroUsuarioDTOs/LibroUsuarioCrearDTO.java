package com.lyra.DTOs.LibroUsuarioDTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// LibroUsuarioCrearDTO
public record LibroUsuarioCrearDTO(
        @NotNull(message = "El usuario es obligatorio")
        Long idUsuario,

        @NotNull(message = "El libro es obligatorio")
        Long id_libro,

        @NotBlank(message = "El estado no puede estar vacío")
        @Pattern(regexp = "leido|leyendo|pendiente",
                message = "Estado debe ser: leido, leyendo o pendiente")
        String estado
) {}

