package com.lyra.controller;


import com.lyra.DTOs.LibroUsuarioDTOs.*;
import com.lyra.model.LibroUsuario;
import com.lyra.repository.LibroUsuarioRepository;
import com.lyra.services.LibroUsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/biblioteca")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class LibroUsuarioController {

    private final LibroUsuarioService libroUsuarioService;
    private final LibroUsuarioRepository libroUsuarioRepository;

    @PostMapping
    public LibroUsuarioDTO agregar(@RequestBody LibroUsuarioCrearDTO dto) {
        return LibroUsuarioDTO.of(
                libroUsuarioService.agregarLibro(dto.idUsuario(), dto.id_libro(), dto.estado())
        );
    }

    @PutMapping("/{idLibroUsuario}")
    public LibroUsuarioDTO editarLibroUsuario(
            @PathVariable Long idLibroUsuario,
            @io.swagger.v3.oas.annotations.parameters.RequestBody EditarLibroUsuarioDTO dto
    ) {
        LibroUsuario actualizado = libroUsuarioService.editarLibroUsuario(
                idLibroUsuario,
                dto.estado(),
                dto.isPrestamo(),
                dto.puntuacion()
        );
        return LibroUsuarioDTO.of(actualizado);
    }

    @PutMapping("/{id}/estado")
    public LibroUsuarioDTO cambiarEstado(@PathVariable Long id, @RequestParam  LibroUsuarioActualizarDTO dto) {
        return LibroUsuarioDTO.of(libroUsuarioService.cambiarEstado(id, dto.estado().getValor()));
    }

    @PutMapping("/{id}/puntuacion")
    public LibroUsuarioDTO puntuar(@PathVariable Long id, @RequestParam Integer puntuacion) {
        return LibroUsuarioDTO.of(libroUsuarioService.puntuarLibro(id, puntuacion));
    }

    @PutMapping("/{id}/prestamo")
    public LibroUsuarioDTO marcarPrestamo(@PathVariable Long id, @RequestParam boolean prestamo) {
        return LibroUsuarioDTO.of(libroUsuarioService.marcarComoPrestamo(id, prestamo));
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<LibroUsuarioDTO> obtenerBiblioteca(@PathVariable Long idUsuario) {
        return libroUsuarioService.obtenerBiblioteca(idUsuario)
                .stream()
                .map(LibroUsuarioDTO::of)
                .toList();
    }

    @GetMapping("/usuario/{idUsuario}/top")
    public List<LibroUsuarioDTO> topPuntuados(@PathVariable Long idUsuario) {
        return libroUsuarioService.topPuntuados(idUsuario)
                .stream()
                .map(LibroUsuarioDTO::of)
                .toList();
    }

    public List<LibroUsuarioDTO> obtenerPorIdUsuario(Long idUsuario) {
        return libroUsuarioRepository.findAllByIdUsuarioWithLibro(idUsuario)
                .stream()
                .map(LibroUsuarioDTO::of)
                .toList();
    }

}

