package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Representa la relación entre un usuario y un libro
 * Indica el estado de lectura (leído, leyendo, pendiente),
 * si el libro está prestado, la fecha de agregación y la puntuación opcional
 * Es una tabla intermedia para gestionar el progreso de lectura del usuario
 */


@Entity
@Table(name = "LibroUsuario")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LibroUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_libro_usuario;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_libro")
    private Libro libro;

    private String estado;
    private Date fecha_agregacion;
    private Boolean isPrestamo;
    private Integer puntuacion;
}
