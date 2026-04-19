package com.lyra.DTOs.LibroUsuarioDTOs;

import com.lyra.model.EstadoLibro;
import com.lyra.model.LibroUsuario;

import java.util.Date;

public record LibroUsuarioDTO(
        Long id,
        Long idUsuario,
        Long id_libro,
        EstadoLibro estado,
        Integer puntuacion,
        Boolean isPrestamo,
        Date fechaAgregacion
) {

    public static LibroUsuarioDTO of(LibroUsuario lu) {
        return new LibroUsuarioDTO(
                lu.getId_libro_usuario(),
                lu.getUsuario().getId(),
                lu.getLibro().getIdLibro(),
                lu.getEstado(),
                lu.getPuntuacion(),
                lu.getIs_prestamo(),
                lu.getFecha_agregacion()
        );
    }
}
