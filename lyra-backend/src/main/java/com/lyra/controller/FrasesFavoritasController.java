package com.lyra.controller;


import com.lyra.DTOs.FrasesFavoritasDTOs.*;
import com.lyra.services.FrasesFavoritasService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/frases")
@RequiredArgsConstructor
public class FrasesFavoritasController {

    private final FrasesFavoritasService frasesService;

    @PostMapping
    public FraseFavoritaDTO crear(@RequestBody FraseFavoritaCrearDTO dto) {
        return FraseFavoritaDTO.of(
                frasesService.crearFrase(dto.idUsuario(), dto.idLibro(), dto.contenido(), dto.pagina())
        );
    }

    @GetMapping("/{id}")
    public FraseFavoritaDTO obtenerPorId(@PathVariable Long id) {
        return FraseFavoritaDTO.of(frasesService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public FraseFavoritaDTO actualizar(@PathVariable Long id, @RequestBody FraseFavoritaActualizarDTO dto) {
        return FraseFavoritaDTO.of(frasesService.actualizarFrase(id, dto.contenido(), dto.pagina()));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        frasesService.eliminarFrase(id);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<FraseFavoritaDTO> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return frasesService.obtenerPorUsuario(idUsuario)
                .stream()
                .map(FraseFavoritaDTO::of)
                .toList();
    }

    @GetMapping("/libro/{idLibro}")
    public List<FraseFavoritaDTO> obtenerPorLibro(@PathVariable Long idLibro) {
        return frasesService.obtenerPorLibro(idLibro)
                .stream()
                .map(FraseFavoritaDTO::of)
                .toList();
    }
}

