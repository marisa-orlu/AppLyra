package com.lyra.DTOs.LibroUsuarioDTOs;

import com.lyra.model.EstadoLibro;

public record LibroUsuarioActualizarDTO(
        EstadoLibro estado,
        Integer puntuacion,
        Boolean isPrestamo

        ) {}

