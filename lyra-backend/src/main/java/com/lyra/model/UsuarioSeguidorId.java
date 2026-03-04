package com.lyra.model;

import lombok.*;
import java.io.Serializable;

/**
 * Clase auxiliar que representa la clave primaria compuesta
 * de la entidad UsuarioSeguidor.
 * Contiene los IDs del usuario y del seguidor.
 * Es necesaria para que JPA gestione correctamente la relación N:N.
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class UsuarioSeguidorId implements Serializable {

    private Long id_usuario;
    private Long id_seguidor;
}
