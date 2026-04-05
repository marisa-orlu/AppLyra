package com.lyra.DTOs.LibroDTOs;

import com.lyra.model.Libro;

public record LibroDTO(
        Long id,
        String titulo,
        String autor,
        String genero,
        Integer anio_publicacion,
        String sinopsis,
        String portada
) {

    public static LibroDTO of(Libro l) {
        return new LibroDTO(
                l.getId_libro(),
                l.getTitulo_libro(),
                l.getAutor(),
                l.getGenero(),
                l.getAnio_publicacion(),
                l.getSinopsis(),
                l.getPortada()
        );
    }
}

