package com.lyra.DTOs.UsuarioDTOs;

public record LoginRequestDTO(
        String email,
        String contrasena
) {}