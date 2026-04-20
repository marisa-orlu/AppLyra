package com.lyra.DTOs.LibroUsuarioDTOs;

import com.lyra.model.EstadoLibro;
import com.lyra.model.LibroUsuario;

import java.util.Date;

public record LibroUsuarioDTO(
        Long id,
        Long idUsuario,
        Long idLibro,
        EstadoLibro estado,
        Integer puntuacion,
        Date fechaAgregacion,
        String portada
) {

    public static LibroUsuarioDTO of(LibroUsuario lu) {
        return new LibroUsuarioDTO(
                lu.getId_libro_usuario(),
                lu.getUsuario() != null ? lu.getUsuario().getId() : null,
                lu.getLibro() != null ? lu.getLibro().getIdLibro() : null,
                lu.getEstado(),
                lu.getPuntuacion(),
                lu.getFecha_agregacion(),
                lu.getLibro() != null ? lu.getLibro().getPortada() : null
        );
    }
}
