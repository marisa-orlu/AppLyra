package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_duenio", nullable = false)
    private Usuario duenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitante", nullable = false)
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_libro", nullable = false)
    private Libro libro;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fecha_inicio;

    @Column(name = "fecha_fin")
    private LocalDate fecha_fin;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPrestamo estado;
}

