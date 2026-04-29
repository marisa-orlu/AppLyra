package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import jakarta.validation.constraints.NotNull;

public record PrestamoCrearDTO(

        @NotNull(message = "El dueño es obligatorio")
        Long idDuenio,

        @NotNull(message = "El solicitante es obligatorio")
        Long idSolicitante,

        @NotNull(message = "El libro es obligatorio")
        Long idLibro
) {}
