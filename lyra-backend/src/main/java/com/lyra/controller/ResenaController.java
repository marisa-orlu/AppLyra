package com.lyra.controller;

import com.lyra.DTOs.ResenaDTOs.*;
import com.lyra.services.ResenaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resenas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping
    public ResenaDTO crear(@RequestBody ResenaCrearDTO dto) {
        return ResenaDTO.of(
                resenaService.crearResena(dto.idUsuario(), dto.idLibro(), dto.texto(), dto.puntuacion())
        );
    }

    @GetMapping("/{id}")
    public ResenaDTO obtenerPorId(@PathVariable Long id) {
        return ResenaDTO.of(resenaService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResenaDTO actualizar(@PathVariable Long id, @RequestBody ResenaActualizarDTO dto) {
        return ResenaDTO.of(resenaService.actualizarResena(id, dto.texto(), dto.puntuacion()));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        resenaService.eliminarResena(id);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<ResenaDTO> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return resenaService.obtenerPorUsuario(idUsuario)
                .stream()
                .map(ResenaDTO::of)
                .toList();
    }

    @GetMapping("/libro/{idLibro}")
    public List<ResenaDTO> obtenerPorLibro(@PathVariable Long idLibro) {
        return resenaService.obtenerPorLibro(idLibro)
                .stream()
                .map(ResenaDTO::of)
                .toList();
    }
}
