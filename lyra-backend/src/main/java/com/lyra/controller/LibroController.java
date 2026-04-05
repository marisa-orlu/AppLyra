package com.lyra.controller;

import com.lyra.DTOs.LibroDTOs.*;
import com.lyra.DTOs.LibroDTOs.LibroCrearDTO;
import com.lyra.model.Libro;
import com.lyra.services.LibroService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/libros")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class LibroController {

    private final LibroService libroService;

    @PostMapping
    public ResponseEntity<LibroDTO> crear(@RequestBody LibroDTO dto) {
        Libro libro = libroService.crearLibro(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibroDTO.of(libro));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(LibroDTO.of(libroService.obtenerPorId(id)));
    }

    @GetMapping
    public ResponseEntity<List<LibroDTO>> obtenerTodos() {
        List<LibroDTO> libros = libroService.obtenerTodos()
                .stream()
                .map(LibroDTO::of)
                .toList();
        return ResponseEntity.ok(libros);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibroDTO> actualizar(@PathVariable Long id, @RequestBody Libro libro) {
        return ResponseEntity.ok(LibroDTO.of(libroService.actualizarLibro(id, libro)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        libroService.eliminarLibro(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar/titulo")
    public ResponseEntity<List<LibroDTO>> buscarPorTitulo(@RequestParam String titulo) {
        List<LibroDTO> resultado = libroService.buscarPorTitulo(titulo)
                .stream().map(LibroDTO::of).toList();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/buscar/autor")
    public ResponseEntity<List<LibroDTO>> buscarPorAutor(@RequestParam String autor) {
        List<LibroDTO> resultado = libroService.buscarPorAutor(autor)
                .stream().map(LibroDTO::of).toList();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/buscar/genero")
    public ResponseEntity<List<LibroDTO>> buscarPorGenero(@RequestParam String genero) {
        List<LibroDTO> resultado = libroService.buscarPorGenero(genero)
                .stream().map(LibroDTO::of).toList();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/buscar/anio")
    public ResponseEntity<List<LibroDTO>> buscarPorAnio(@RequestParam Integer anio) {
        List<LibroDTO> resultado = libroService.buscarPorAnio(anio)
                .stream().map(LibroDTO::of).toList();
        return ResponseEntity.ok(resultado);
    }
}

