package com.lyra.DTOs.UsuarioDTOs;

public record UsuarioActualizarDTO(
        String nombre,
        String email,
        String biografia,
        String fotoPerfil
) {}

