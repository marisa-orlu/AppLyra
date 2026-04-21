package com.lyra.DTOs.LibroUsuarioDTOs;

public record EditarLibroUsuarioDTO(
        Integer estado,
        Boolean isPrestamo,
        Integer puntuacion
) {
}
