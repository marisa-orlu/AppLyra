package com.lyra.DTOs.LibroDTOs;

import com.lyra.model.Libro;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LibroDTO(
        Long id,

        @NotBlank(message = "El título no puede estar vacío")
        @Size(max = 200, message = "El título no puede superar los 200 caracteres")
        String titulo,

        @NotBlank(message = "El autor no puede estar vacío")
        String autor,

        String genero,

        @Min(value = 1000, message = "El año no parece válido")
        @Max(value = 2100, message = "El año no parece válido")
        Integer anio_publicacion,

        String sinopsis,
        String portada
) {

    public static LibroDTO of(Libro l) {
        return new LibroDTO(
                l.getIdLibro(),
                l.getTitulo_libro(),
                l.getAutor(),
                l.getGenero(),
                l.getAnio_publicacion(),
                l.getSinopsis(),
                l.getPortada()
        );
    }
}

