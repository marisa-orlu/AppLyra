package com.lyra.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

/**
 * Representa la relación de seguimiento entre dos usuarios
 * Un usuario puede seguir a otro, y esta entidad almacena esa relación
 * junto con la fecha en la que comenzó el seguimiento
 * Utiliza una clave primaria compuesta (UsuarioSeguidorId)
 */


@Entity
@Table(name = "UsuarioSeguidor")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UsuarioSeguidorId.class)
@Builder

public class UsuarioSeguidor {

    @Id
    private Long id_usuario;

    @Id
    private Long id_seguidor;

    private Date fecha;
}

