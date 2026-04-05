package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Representa una reseña escrita por un usuario sobre un libro
 * Incluye el texto de la reseña, la puntuación y la fecha de publicación
 * Está asociada a un usuario y a un libro
 */


@Entity
@Table(name = "resena")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_resena;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_libro")
    private Libro libro;

    @Column(columnDefinition = "TEXT")
    private String texto;

    private Integer puntuacion;
    private Date fecha_publicacion;
}

