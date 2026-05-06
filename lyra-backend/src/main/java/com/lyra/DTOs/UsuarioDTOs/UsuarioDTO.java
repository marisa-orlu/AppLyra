package com.lyra.DTOs.UsuarioDTOs;

import com.lyra.model.Usuario;

import java.time.LocalDateTime;

public record UsuarioDTO(
        Long id,
        String nombre,
        String email,
        String biografia,
        String fotoPerfil,
        LocalDateTime fechaRegistro
) {

    public static UsuarioDTO of(Usuario u) {
        return new UsuarioDTO(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getBiografia(),
                u.getFotoPerfil(),
                u.getFechaRegistro()
        );
    }
}
