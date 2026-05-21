DROP DATABASE IF EXISTS appLyra;

CREATE DATABASE appLyra;
USE appLyra;

-- TABLA: Usuario

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATE NOT NULL,
    foto_perfil VARCHAR(255),
    biografia_usuario TEXT,
    rol ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER'
);


-- TABLA: Libro

CREATE TABLE Libro (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo_libro VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    genero VARCHAR(100),
    anio_publicacion INT,
    sinopsis TEXT,
    portada VARCHAR(255),
    UNIQUE (titulo_libro, autor)
);


-- TABLA: UsuarioSeguidor (N:N entre usuarios)

CREATE TABLE UsuarioSeguidor (
    id_usuario INT NOT NULL,
    id_seguidor INT NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (id_usuario, id_seguidor),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_seguidor) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);


-- TABLA: LibroUsuario

CREATE TABLE LibroUsuario (
    id_libro_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    estado ENUM('leido', 'leyendo', 'pendiente') NOT NULL,
    fecha_agregacion DATE NOT NULL,
    isPrestamo BOOLEAN DEFAULT FALSE,
    puntuacion INT,
    UNIQUE (id_usuario, id_libro),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
        ON DELETE CASCADE
);



-- TABLA: PrestamoUsuarioLibro

CREATE TABLE PrestamoUsuarioLibro (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,

    id_duenio INT NOT NULL,
    id_solicitante INT NOT NULL,
    id_libro INT NOT NULL,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'DEVUELTO', 'PENDIENTE_DEVOLUCION') NOT NULL,

    FOREIGN KEY (id_duenio) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_solicitante) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
);


-- TABLA: Reseña

CREATE TABLE Resena (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    texto TEXT NOT NULL,
    puntuacion INT NOT NULL,
    fecha_publicacion DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
        ON DELETE CASCADE
);


-- TABLA: FrasesFavoritas

CREATE TABLE FrasesFavoritas (
    id_frase INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    contenido TEXT NOT NULL,
    pagina INT,
    fecha DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
        ON DELETE CASCADE
);
