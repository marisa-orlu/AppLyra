package com.lyra.controller;

import com.lyra.DTOs.UsuarioSeguidorDTOs.*;
import com.lyra.services.UsuarioSeguidorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seguidores")
@RequiredArgsConstructor
public class UsuarioSeguidorController {

    private final UsuarioSeguidorService seguidorService;

    @PostMapping
    public UsuarioSeguidorDTO seguir(@RequestBody UsuarioSeguidorCrearDTO dto) {
        return UsuarioSeguidorDTO.of(
                seguidorService.seguirUsuario(dto.idUsuario(), dto.idSeguidor())
        );
    }

    @DeleteMapping
    public void dejarDeSeguir(@RequestParam Long idUsuario, @RequestParam Long idSeguidor) {
        seguidorService.dejarDeSeguir(idUsuario, idSeguidor);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<UsuarioSeguidorDTO> obtenerSeguidores(@PathVariable Long idUsuario) {
        return seguidorService.obtenerSeguidores(idUsuario)
                .stream()
                .map(UsuarioSeguidorDTO::of)
                .toList();
    }

    @GetMapping("/seguidor/{idSeguidor}")
    public List<UsuarioSeguidorDTO> obtenerSeguidos(@PathVariable Long idSeguidor) {
        return seguidorService.obtenerSeguidos(idSeguidor)
                .stream()
                .map(UsuarioSeguidorDTO::of)
                .toList();
    }
}
