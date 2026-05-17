<div align="center">

<img src="https://i.imgur.com/YWSODac.png" style="max-width: 400px; width: 100%;">

# App Lyra 📚  
### Aplicación social de gestión de biblioteca personal

</div>

Lyra es una aplicación multiplataforma orientada a lectores que permite gestionar una biblioteca personal con un enfoque social.  
El proyecto combina funcionalidades de seguimiento de lectura, reseñas, frases favoritas y un sistema de préstamo de libros físicos entre usuarios.

Desarrollado como Trabajo de Fin de Grado del ciclo **Desarrollo de Aplicaciones Multiplataforma (DAM)**.

---

# ✨ Características principales

- 📖 Gestión de biblioteca personal
- ⭐ Valoraciones y reseñas
- 📝 Guardado de frases favoritas
- 👥 Sistema social de seguimiento entre usuarios
- 📚 Exploración de bibliotecas públicas
- 🔄 Sistema de préstamos de libros físicos
- 🏆 Ranking dinámico Top libros
- 🔐 Autenticación segura con JWT y Spring Security
- 📱 Aplicación web responsive y futura app móvil con React Native
- 🐳 Contenerización mediante Docker

---

# 🛠️ Tecnologías utilizadas

## Backend
- Java 17
- Spring Boot 3.x
- Spring Security
- JWT
- Hibernate / JPA
- Maven

## Frontend Web
- Angular
- TypeScript
- Bootstrap 5
- Angular Material

## Base de datos
- MySQL

## DevOps y herramientas
- Docker
- Docker Compose
- Git & GitHub
- Postman

## Aplicación móvil
- React Native
- Expo Go

---

# 🏗️ Arquitectura del proyecto

```text
Frontend Angular
       ↓
 API REST Spring Boot
       ↓
      MySQL
```

La aplicación sigue una arquitectura desacoplada basada en API REST, permitiendo:
- separación entre frontend y backend,
- mantenibilidad,
- escalabilidad,
- futura integración móvil.

---

# 📂 Estructura del proyecto

```text
Lyra/
│
├── lyra-backend/        → API REST Spring Boot
├── lyra-frontend/       → Frontend Angular
├── docker-compose.yml
└── README.md
```

---

# 🗄️ Modelo de datos

La base de datos está diseñada siguiendo un modelo relacional normalizado.

Entidades principales:
- Usuario
- Libro
- LibroUsuario
- Reseña
- FrasesFavoritas
- PrestamoUsuarioLibro
- UsuarioSeguidor

---

# 🚀 Instalación y ejecución

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/TU-USUARIO/lyra.git
cd lyra
```

---

# ⚙️ Configuración backend

## Crear base de datos MySQL

Ejecutar el script SQL incluido en el proyecto:

```sql
CREATE DATABASE appLyra;
```

Importar posteriormente el script completo de tablas.

---

## Configurar application.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/appLyra
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD
```

---

# ▶️ Ejecutar backend

```bash
cd lyra-backend
./mvnw spring-boot:run
```

Backend disponible en:

```text
http://localhost:8080
```

---

# ▶️ Ejecutar frontend

```bash
cd lyra-frontend
npm install
ng serve
```

Frontend disponible en:

```text
http://localhost:4200
```

---

# 🐳 Docker

El proyecto incluye contenerización mediante Docker para backend y frontend web.

## Construcción

```bash
docker compose build
```

---

## Ejecución

```bash
docker compose up
```

---

# 📱 Aplicación móvil

Actualmente se encuentra en desarrollo una versión móvil utilizando:
- React Native
- Expo Go

La aplicación móvil consumirá la misma API REST desarrollada para la versión web.

---

# 🔐 Seguridad

La autenticación del sistema se realiza mediante:
- Spring Security
- JWT (JSON Web Tokens)
- cifrado BCrypt para contraseñas

---

# 🧪 Pruebas

Se han realizado:
- pruebas funcionales,
- pruebas de endpoints REST mediante Postman,
- pruebas de integración frontend-backend,
- validaciones de autenticación y autorización.

---

# 📚 Bibliografía y documentación

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- Hibernate ORM Documentation: https://hibernate.org/orm/documentation/
- Angular Documentation: https://angular.dev/
- React Native Docs: https://reactnative.dev/docs/getting-started
- Docker Documentation: https://docs.docker.com/
- Expo Documentation: https://docs.expo.dev/

---

# 👩‍💻 Autora

**María Luisa Ortega Lucena**  
Trabajo de Fin de Grado — Desarrollo de Aplicaciones Multiplataforma  
CES Lope de Vega — Curso 2025/2026