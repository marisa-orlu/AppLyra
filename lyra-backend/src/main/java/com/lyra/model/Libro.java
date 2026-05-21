package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Representa un libro dentro de la plataforma
 * Contiene información bibliográfica y mantiene relaciones con reseñas,
 * frases favoritas, préstamos y asociaciones con usuarios
 */


@Entity
@Table(
    name = "libro",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_libro_titulo_autor",
            columnNames = {"titulo_libro", "autor"}
        )
    }
)
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_libro")
    private Long idLibro;

    @Column(name = "titulo_libro")
    private String titulo_libro;
    @Column(name = "autor")
    private String autor;

    private String genero;

    @Column(name = "anio_publicacion")
    private Integer anio_publicacion;

    @Column(columnDefinition = "TEXT")
    private String sinopsis;

    private String portada;

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Resena> resenas;

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<FrasesFavoritas> frases;

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<LibroUsuario> usuarios_libro;

    @OneToMany(mappedBy = "libro", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<PrestamoUsuarioLibro> prestamos;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_creador", nullable = false)
    private Usuario usuarioCreador;

}
