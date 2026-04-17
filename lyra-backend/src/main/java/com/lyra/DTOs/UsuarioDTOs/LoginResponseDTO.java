package com.lyra.DTOs.UsuarioDTOs;

public record LoginResponseDTO(
        Long id,
        String nombre,
        String email,
        String rol,
        String token
) {}