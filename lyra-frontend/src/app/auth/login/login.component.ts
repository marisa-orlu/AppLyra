import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  contrasena: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(event?: Event) {
    event?.preventDefault();

    if (!this.email || !this.contrasena) {
      this.errorMessage = 'Ambos campos son obligatorios';
      return;
    }

    const loginRequest: LoginRequest = { email: this.email, contrasena: this.contrasena };
    this.authService.login(loginRequest).subscribe({
      next: (res) => {
        const token = res.token ?? res.jwt ?? res.accessToken;
        const role = res.role ?? res.rol;

        if (!token) {
          this.errorMessage = 'Login correcto, pero no se recibió token de autenticación.';
          return;
        }

        this.authService.saveToken(token);

        if (role) {
          this.authService.saveRole(role);
        }

        console.log('Login correcto', {
          email: this.email,
          rol: role
        });

        switch (role) {
          case 'ROLE_ADMIN':
            this.router.navigate(['/dashboard']);
            break;
          case 'ROLE_USER':
          default:
            this.router.navigate(['/home-usuario']);
            break;
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          const backendMessage = err.error?.message || err.error?.error;
          this.errorMessage = backendMessage || 'Usuario o contraseña incorrectos';
          return;
        }

        this.errorMessage = 'No se pudo iniciar sesión. Inténtalo de nuevo.';
      }
    });
  }


  registrarUsuario() {
    this.router.navigate(['/registro-usuario']);
  }
}
