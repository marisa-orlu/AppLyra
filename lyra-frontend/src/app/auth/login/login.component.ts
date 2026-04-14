import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const data = this.loginForm.value;

    this.authService.login(data).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/biblioteca']);
      },
      error: () => {
        this.isSubmitting = false;
        alert('Credenciales incorrectas');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
