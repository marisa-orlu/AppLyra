package com.lyra.DTOs.LibroUsuarioDTOs;

public record LibroUsuarioActualizarDTO(
        String estado,
        Integer puntuacion,
        Boolean isPrestamo
) {}

