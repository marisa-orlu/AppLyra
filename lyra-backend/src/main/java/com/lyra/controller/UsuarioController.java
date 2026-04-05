package com.lyra.controller;

import com.lyra.DTOs.UsuarioDTOs.*;
import com.lyra.model.Rol;
import com.lyra.model.Usuario;
import com.lyra.security.jwt.JwtService;
import com.lyra.services.UsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

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
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.contrasena())
        );

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = jwtService.generateToken(usuario);

        return ResponseEntity.ok(new LoginResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                token
        ));
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
