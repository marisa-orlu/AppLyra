package com.lyra.repository;

import com.lyra.model.FrasesFavoritas;
import com.lyra.model.Usuario;
import com.lyra.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FrasesFavoritasRepository extends JpaRepository<FrasesFavoritas, Long> {

    List<FrasesFavoritas> findByUsuario(Usuario usuario);

    List<FrasesFavoritas> findByLibro(Libro libro);
}
