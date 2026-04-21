import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  contrasena = '';
  repetirContrasena = '';
  fotoPerfil: File | null = null;

  cargando = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fotoPerfil = input.files?.[0] ?? null;
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.nombre.trim();
    const email = this.email.trim().toLowerCase();
    const contrasena = this.contrasena;

    if (!nombre || !email || !contrasena) {
      this.errorMessage = 'Nombre, email y contrasena son obligatorios.';
      return;
    }

    if (contrasena.length < 6) {
      this.errorMessage = 'La contrasena debe tener al menos 6 caracteres.';
      return;
    }

    if (contrasena !== this.repetirContrasena) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }

    this.cargando = true;

    this.authService.register(
      {
        nombre,
        email,
        contrasena
      },
      this.fotoPerfil
    ).subscribe({
      next: () => {
        this.cargando = false;
        this.successMessage = 'Usuario registrado correctamente. Redirigiendo al login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 900);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        const backendMessage = err.error?.message || err.error?.error;
        this.errorMessage = backendMessage || 'No se pudo registrar el usuario.';
      }
    });
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }

}
