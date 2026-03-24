package com.lyra.services;

import com.lyra.model.Usuario;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    // Crear usuario (registro)
    public Usuario crearUsuario(Usuario usuario) {

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        return usuarioRepository.save(usuario);
    }
    // Obtener usuario por ID
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(Long id, Usuario datos) {

        Usuario usuario = obtenerPorId(id);
        usuario.setNombre(datos.getNombre());
        usuario.setEmail(datos.getEmail());
        usuario.setBiografia(datos.getBiografia());
        usuario.setFotoPerfil(datos.getFotoPerfil());

        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario
    public void eliminarUsuario(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuarioRepository.delete(usuario);
    }

    // Login básico (antes de JWT)
    public Usuario login(String email, String contrasena) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email no registrado"));

        if (!usuario.getContrasena().equals(contrasena)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return usuario;
    }


}
