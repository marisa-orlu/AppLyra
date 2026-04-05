package com.lyra.repository;

import com.lyra.model.UsuarioSeguidor;
import com.lyra.model.UsuarioSeguidorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsuarioSeguidorRepository extends JpaRepository<UsuarioSeguidor, UsuarioSeguidorId> {

    @Query("SELECT us FROM UsuarioSeguidor us WHERE us.id_usuario = :idUsuario")
    List<UsuarioSeguidor> findByIdUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT us FROM UsuarioSeguidor us WHERE us.id_seguidor = :idSeguidor")
    List<UsuarioSeguidor> findByIdSeguidor(@Param("idSeguidor") Long idSeguidor);

    @Query("SELECT CASE WHEN COUNT(us) > 0 THEN true ELSE false END " +
            "FROM UsuarioSeguidor us WHERE us.id_usuario = :idUsuario AND us.id_seguidor = :idSeguidor")
    boolean existeSeguimiento(@Param("idUsuario") Long idUsuario,
                              @Param("idSeguidor") Long idSeguidor);
}

