package com.lyra.DTOs.UsuarioDTOs;

import com.lyra.model.Usuario;

public record UsuarioDTO(
        Long id,
        String nombre,
        String email,
        String biografia,
        String fotoPerfil
) {

    public static UsuarioDTO of(Usuario u) {
        return new UsuarioDTO(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getBiografia(),
                u.getFotoPerfil()
        );
    }
}


