package com.lyra.DTOs.UsuarioDTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// UsuarioActualizarDTO
public record UsuarioActualizarDTO(
        @NotBlank(message = "El nombre no puede estar vacío")
        @Size(min = 3, max = 50, message = "El nombre debe tener entre 3 y 50 caracteres")
        String nombre,

        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El email no tiene un formato válido")
        String email,

        @Size(max = 500, message = "La biografía no puede superar los 500 caracteres")
        String biografia,

        String fotoPerfil
) {}
