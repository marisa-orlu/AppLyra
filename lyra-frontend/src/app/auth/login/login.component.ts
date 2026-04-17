import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
        if (res.token) {
          this.authService.saveToken(res.token);
        }

        if (res.role) {
          localStorage.setItem('rol', res.role);
        }

        console.log('Login correcto', {
          email: this.email,
          rol: res.role
        });

        switch (res.role) {
          case 'ROLE_ADMIN':
            this.router.navigate(['/dashboard']);
            break;
          case 'ROLE_USER':
          default:
            this.router.navigate(['/home-usuario']);
            break;
        }
      },
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }


  registrarUsuario() {
    this.router.navigate(['/registro-usuario']);
  }
}
