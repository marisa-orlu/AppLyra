package com.lyra.DTOs.PrestamoUsuarioLibroDTOs;

import com.lyra.model.EstadoLibro;
import com.lyra.model.EstadoPrestamo;

public record PrestamoActualizarDTO(
        EstadoPrestamo estado
) {}

