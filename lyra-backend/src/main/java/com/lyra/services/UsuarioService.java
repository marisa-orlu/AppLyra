package com.lyra.services;

import com.lyra.DTOs.UsuarioDTOs.UsuarioActualizarDTO;
import com.lyra.DTOs.UsuarioDTOs.UsuarioRegistroDTO;
import com.lyra.model.Rol;
import com.lyra.model.Usuario;
import com.lyra.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    // Crear usuario (registro)
    public Usuario crearUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("El email ya está registrado");
        }
        if (usuarioRepository.existsByNombre(dto.nombre())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        Usuario usuario = Usuario.builder()
                .nombre(dto.nombre())
                .email(dto.email())
                .contrasena(dto.contrasena())  // TODO: cifrar
                .fechaRegistro(LocalDate.now())
                .build();

        return usuarioRepository.save(usuario);
    }

    // Obtener usuario por ID
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe un usuario con id: " + id));
    }

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(Long id, UsuarioActualizarDTO dto) {
        Usuario usuario = obtenerPorId(id);
        usuario.setNombre(dto.nombre());
        usuario.setEmail(dto.email());
        usuario.setBiografia(dto.biografia());
        usuario.setFotoPerfil(dto.fotoPerfil());
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuarioRepository.delete(usuario);
    }

    public Usuario login(String email, String contrasena) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Email no registrado"));

        if (!usuario.getContrasena().equals(contrasena)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }

    public List<Usuario> buscarPorNombre(String nombre) {
        return usuarioRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // Service
    public List<Usuario> obtenerPorRol(Rol rol) {
        return usuarioRepository.findByRol(rol);
    }


}
