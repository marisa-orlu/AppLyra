package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import jakarta.validation.constraints.NotNull;

// PrestamoCrearDTO
public record PrestamoCrearDTO(
        @NotNull(message = "El usuario es obligatorio")
        Long idUsuario,

        @NotNull(message = "El libro es obligatorio")
        Long id_libro
) {}

