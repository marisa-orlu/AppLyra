package com.lyra.controller;

import com.lyra.DTOs.UsuarioDTOs.UsuarioActualizarDTO;
import com.lyra.DTOs.UsuarioDTOs.UsuarioDTO;
import com.lyra.DTOs.UsuarioDTOs.UsuarioRegistroDTO;
import com.lyra.model.Rol;
import com.lyra.model.Usuario;
import com.lyra.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Registrar usuario
    @PostMapping
    public ResponseEntity<UsuarioDTO> registrar(@RequestBody UsuarioRegistroDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UsuarioDTO.of(usuarioService.crearUsuario(dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(UsuarioDTO.of(usuarioService.obtenerPorId(id)));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerTodos() {
        List<UsuarioDTO> usuarios = usuarioService.obtenerTodos()
                .stream()
                .map(UsuarioDTO::of)
                .toList();
        return ResponseEntity.ok(usuarios);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestParam String email,
                                            @RequestParam String contrasena) {
        return ResponseEntity.ok(UsuarioDTO.of(usuarioService.login(email, contrasena)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<UsuarioDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<UsuarioDTO> resultado = usuarioService.buscarPorNombre(nombre)
                .stream()
                .map(UsuarioDTO::of)
                .toList();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<UsuarioDTO>> obtenerPorRol(@PathVariable Rol rol) {
        List<UsuarioDTO> resultado = usuarioService.obtenerPorRol(rol)
                .stream()
                .map(UsuarioDTO::of)
                .toList();
        return ResponseEntity.ok(resultado);
    }
}
