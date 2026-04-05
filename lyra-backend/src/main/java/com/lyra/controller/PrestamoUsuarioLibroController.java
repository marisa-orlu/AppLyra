package com.lyra.controller;

import com.lyra.DTOs.PrestamoUsuarioLibroDTOs.*;
import com.lyra.services.PrestamoUsuarioLibroService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prestamos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PrestamoUsuarioLibroController {

    private final PrestamoUsuarioLibroService prestamoService;

    @PostMapping
    public PrestamoDTO crear(@RequestBody PrestamoCrearDTO dto) {
        return PrestamoDTO.of(
                prestamoService.crearPrestamo(dto.idUsuario(), dto.idLibro())
        );
    }

    @PutMapping("/{id}")
    public PrestamoDTO actualizarEstado(@PathVariable Long id, @RequestBody PrestamoActualizarDTO dto) {
        return PrestamoDTO.of(prestamoService.cambiarEstado(id, dto.estado()));
    }

    @PutMapping("/{id}/aceptar")
    public PrestamoDTO aceptar(@PathVariable Long id) {
        return PrestamoDTO.of(prestamoService.aceptarPrestamo(id));
    }

    @PutMapping("/{id}/rechazar")
    public PrestamoDTO rechazar(@PathVariable Long id) {
        return PrestamoDTO.of(prestamoService.rechazarPrestamo(id));
    }

    @PutMapping("/{id}/devolver")
    public PrestamoDTO devolver(@PathVariable Long id) {
        return PrestamoDTO.of(prestamoService.devolverPrestamo(id));
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<PrestamoDTO> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return prestamoService.obtenerPorUsuario(idUsuario)
                .stream()
                .map(PrestamoDTO::of)
                .toList();
    }

    @GetMapping("/libro/{idLibro}")
    public List<PrestamoDTO> obtenerPorLibro(@PathVariable Long idLibro) {
        return prestamoService.obtenerPorLibro(idLibro)
                .stream()
                .map(PrestamoDTO::of)
                .toList();
    }
}

