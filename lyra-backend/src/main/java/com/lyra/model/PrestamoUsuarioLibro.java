package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Representa un préstamo de un libro entre usuarios
 * Contiene fechas de inicio y fin, el estado del préstamo
 * y las referencias al usuario y al libro involucrados
 */


@Entity
@Table(name = "prestamousuariolibro")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PrestamoUsuarioLibro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_prestamo;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_libro")
    private Libro libro;

    @Column(name = "fecha_inicio")
    private Date fecha_inicio;

    @Column(name = "fecha_fin")
    private Date fecha_fin;

    private String estado;
}

