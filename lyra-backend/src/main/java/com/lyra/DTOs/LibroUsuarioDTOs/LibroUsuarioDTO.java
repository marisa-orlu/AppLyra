package com.lyra.DTOs.LibroUsuarioDTOs;

import com.lyra.model.LibroUsuario;

import java.util.Date;

public record LibroUsuarioDTO(
        Long id,
        Long idUsuario,
        Long idLibro,
        String estado,
        Integer puntuacion,
        Boolean isPrestamo,
        Date fechaAgregacion
) {

    public static LibroUsuarioDTO of(LibroUsuario lu) {
        return new LibroUsuarioDTO(
                lu.getId_libro_usuario(),
                lu.getUsuario().getId(),
                lu.getLibro().getId_libro(),
                lu.getEstado(),
                lu.getPuntuacion(),
                lu.getIsPrestamo(),
                lu.getFecha_agregacion()
        );
    }
}
