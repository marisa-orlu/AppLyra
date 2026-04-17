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
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.contrasena())
            );

            Object principal = auth.getPrincipal();
            String email;
            String rol;
            Usuario usuarioToken;

            if (principal instanceof Usuario u) {
                email = u.getEmail();
                rol = u.getRol().name();
                usuarioToken = u;
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
                email = userDetails.getUsername(); // si username \= email
                rol = userDetails.getAuthorities().stream().findFirst()
                        .map(a -> a.getAuthority())
                        .orElse("ROLE_USER");

                // Carga tu entidad para poder firmar con generateToken\(Usuario\)
                usuarioToken = usuarioService.obtenerPorEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("error", "No se pudo autenticar el usuario"));
            }

            String token = jwtService.generateToken(usuarioToken);

            return ResponseEntity.ok(java.util.Map.of(
                    "email", email,
                    "rol", rol,
                    "token", token ));
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Credenciales inválidas"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error interno en login"));
        }
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
