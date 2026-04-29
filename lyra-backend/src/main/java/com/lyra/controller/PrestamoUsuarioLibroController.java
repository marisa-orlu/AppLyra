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
                prestamoService.crearPrestamo(
                        dto.idDuenio(),
                        dto.idSolicitante(),
                        dto.idLibro()
                )
        );
    }

    @PutMapping("/{id}")
    public PrestamoDTO actualizarEstado(@PathVariable Long id, @RequestBody PrestamoActualizarDTO dto) {
        return PrestamoDTO.of(prestamoService.cambiarEstado(id, dto.estado().getValor()));
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

    @GetMapping("/duenio/{idDuenio}")
    public List<PrestamoDTO> obtenerPorDuenio(@PathVariable Long idDuenio) {
        return prestamoService.obtenerPorDuenio(idDuenio)
                .stream()
                .map(PrestamoDTO::of)
                .toList();
    }

    @GetMapping("/solicitante/{idSolicitante}")
    public List<PrestamoDTO> obtenerPorSolicitante(@PathVariable Long idSolicitante) {
        return prestamoService.obtenerPorSolicitante(idSolicitante)
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
