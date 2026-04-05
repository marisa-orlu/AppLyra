package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Representa una frase favorita guardada por un usuario de un libro concreto
 * Incluye el contenido de la frase, la página y la fecha en la que fue guardada
 */


@Entity
@Table(name = "frasesfavoritas")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FrasesFavoritas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_frase;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_libro")
    private Libro libro;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    private Integer pagina;
    private Date fecha;
}

