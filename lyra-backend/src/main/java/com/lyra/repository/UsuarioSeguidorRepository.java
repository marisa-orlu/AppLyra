package com.lyra.repository;

import com.lyra.model.UsuarioSeguidor;
import com.lyra.model.UsuarioSeguidorId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UsuarioSeguidorRepository extends JpaRepository<UsuarioSeguidor, UsuarioSeguidorId> {

    List<UsuarioSeguidor> findByIdUsuario(Long idUsuario);

    List<UsuarioSeguidor> findByIdSeguidor(Long idSeguidor);
}
