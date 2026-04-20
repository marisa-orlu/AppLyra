import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../interfaces/login-request';
import { LoginResponse } from '../interfaces/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'token';
  private roleKey = 'rol';
  private apiUrl = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    const payload: LoginRequest = {
      email: data.email.trim().toLowerCase(),
      contrasena: data.contrasena
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  saveRole(role: string): void {
    localStorage.setItem(this.roleKey, role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdmin(): boolean {
    const role = this.getRole();

    if (!role) {
      return false;
    }

    const normalizedRole = role.toUpperCase().replace('ROLE_', '');
    return normalizedRole === 'ADMIN';
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }
}
