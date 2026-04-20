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
  private userIdKey = 'userId';
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

  saveUserId(id: number): void {
    localStorage.setItem(this.userIdKey, String(id));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): number | null {
    const raw = localStorage.getItem(this.userIdKey);

    if (raw) {
      const id = Number(raw);
      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    }

    // Fallback: si no hay id guardado, intentamos extraerlo del JWT.
    const token = this.getToken();
    const idFromToken = this.extractUserIdFromToken(token);

    if (idFromToken) {
      this.saveUserId(idFromToken);
      return idFromToken;
    }

    return null;
  }

  extractUserIdFromToken(token: string | null): number | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
      const json = atob(padded);
      const data = JSON.parse(json) as Record<string, unknown>;

      const candidates = [
        data['id'],
        data['userId'],
        data['id_usuario'],
        data['idUsuario'],
        data['uid'],
        data['sub']
      ];

      for (const candidate of candidates) {
        const id = Number(candidate);
        if (Number.isFinite(id) && id > 0) {
          return id;
        }
      }
    } catch {
      return null;
    }

    return null;
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
    localStorage.removeItem(this.userIdKey);
  }
}
