package com.lyra.services;

import com.lyra.exception.OperacionNoPermitidaException;
import com.lyra.model.Usuario;
import com.lyra.model.UsuarioSeguidor;
import com.lyra.model.UsuarioSeguidorId;
import com.lyra.repository.UsuarioRepository;
import com.lyra.repository.UsuarioSeguidorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioSeguidorService {

    private final UsuarioSeguidorRepository usuarioSeguidorRepository;
    private final UsuarioRepository usuarioRepository;

    // Seguir a un usuario
    public UsuarioSeguidor seguirUsuario(Long idUsuario, Long idSeguidor) {

        if (idUsuario.equals(idSeguidor)) {
            throw new OperacionNoPermitidaException("Un usuario no puede seguirse a sí mismo");
        }

        // Validar usuarios
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuarioRepository.findById(idSeguidor)
                .orElseThrow(() -> new RuntimeException("Seguidor no encontrado"));

        UsuarioSeguidorId id = new UsuarioSeguidorId(idUsuario, idSeguidor);

        // Si ya existe, simplemente lo devolvemos
        if (usuarioSeguidorRepository.existsById(id)) {
            return usuarioSeguidorRepository.findById(id).get();
        }

        UsuarioSeguidor relacion = UsuarioSeguidor.builder()
                .id_usuario(idUsuario)
                .id_seguidor(idSeguidor)
                .fecha(new Date())
                .build();

        return usuarioSeguidorRepository.save(relacion);
    }

    // Dejar de seguir
    public void dejarDeSeguir(Long idUsuario, Long idSeguidor) {
        UsuarioSeguidorId id = new UsuarioSeguidorId(idUsuario, idSeguidor);

        UsuarioSeguidor relacion = usuarioSeguidorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relación de seguimiento no encontrada"));

        usuarioSeguidorRepository.delete(relacion);
    }

    // Obtener seguidores de un usuario (quién lo sigue)
    public List<UsuarioSeguidor> obtenerSeguidores(Long id_usuario) {

        usuarioRepository.findById(id_usuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return usuarioSeguidorRepository.findByIdUsuario(id_usuario);
    }

    // Obtener seguidos por un usuario (a quién sigue)
    public List<UsuarioSeguidor> obtenerSeguidos(Long idSeguidor) {

        usuarioRepository.findById(idSeguidor)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return usuarioSeguidorRepository.findByIdSeguidor(idSeguidor);
    }
}
