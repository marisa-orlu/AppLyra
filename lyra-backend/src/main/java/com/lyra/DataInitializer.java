package com.lyra;

import com.lyra.model.Rol;
import com.lyra.model.Usuario;
import com.lyra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("adminLyra@lyra.com")) {
            Usuario admin = Usuario.builder()
                    .nombre("AdminLyra")
                    .email("adminLyra@lyra.com")
                    .contrasena(passwordEncoder.encode("admin1234"))
                    .fechaRegistro(LocalDateTime.now())
                    .rol(Rol.ADMIN)
                    .build();
            usuarioRepository.save(admin);
            System.out.println(">>> Admin creado correctamente");
        }
    }
}