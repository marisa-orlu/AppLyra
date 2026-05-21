package com.lyra.controller;

import com.lyra.DTOs.LibroDTOs.*;
import com.lyra.DTOs.LibroDTOs.LibroCrearDTO;
import com.lyra.model.Libro;
import com.lyra.model.Usuario;
import com.lyra.services.LibroService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;


import java.util.List;

@RestController
@RequestMapping("/libros")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class LibroController {

    private final LibroService libroService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<LibroDTO> crear(
            @Valid @RequestPart("data") LibroCrearDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal Usuario usuarioAutenticado
    ) {
        Libro libro = libroService.crearLibro(dto, file, usuarioAutenticado);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibroDTO.of(libro));
    }




    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(LibroDTO.of(libroService.obtenerPorId(id)));
    }
/*
    @GetMapping
    public ResponseEntity<Page<LibroDTO>> obtenerTodos(@PageableDefault Pageable pageable) {
        Page<LibroDTO> libros = libroService.obtenerTodos(pageable)
                .stream()
                .map(LibroDTO::of)
                .toList();
        return ResponseEntity.ok(libros);
    }

 */
    @GetMapping
    public Page<LibroDTO> obtenerTodos(@PageableDefault(page = 0, size = 15) Pageable pageable) {
        return libroService.obtenerTodos(pageable)
                .map(LibroDTO::of);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibroDTO> actualizar(
            @PathVariable Long id,
            @RequestBody LibroDTO libro,
            @AuthenticationPrincipal Usuario usuarioAutenticado
    ) {
        return ResponseEntity.ok(
                LibroDTO.of(libroService.actualizarLibro(id, libro, usuarioAutenticado))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioAutenticado
    ) {
        libroService.eliminarLibro(id, usuarioAutenticado);
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

