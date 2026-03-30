package com.lyra.DTOs.UsuarioSeguidorDTOs;

import com.lyra.model.UsuarioSeguidor;

import java.util.Date;

public record UsuarioSeguidorDTO(
        Long idUsuario,
        Long idSeguidor,
        Date fecha
) {

    public static UsuarioSeguidorDTO of(UsuarioSeguidor u) {
        return new UsuarioSeguidorDTO(
                u.getId_usuario(),
                u.getId_seguidor(),
                u.getFecha()
        );
    }
}


