import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UsuarioActualizarRequest, UsuarioCuenta } from '../interfaces/usuario-cuenta';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = 'http://localhost:8080/usuarios';
  private readonly uploadsUrl = 'http://localhost:8080/uploads';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  obtenerTodos(): Observable<UsuarioCuenta[]> {
    return this.http.get<Record<string, unknown>[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(payload => {
        const lista = Array.isArray(payload) ? payload : [];
        return lista.map(item => this.mapearUsuarioCuenta(item));
      })
    );
  }

  obtenerPorId(id: number): Observable<UsuarioCuenta> {
    const idNormalizado = Number(id);

    if (!Number.isFinite(idNormalizado) || idNormalizado <= 0) {
      return throwError(() => new Error('Id de usuario invalido'));
    }

    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/${idNormalizado}`, {
      headers: this.getAuthHeaders()
    }).pipe(map(payload => this.mapearUsuarioCuenta(payload)));
  }

  actualizarUsuario(id: number, data: UsuarioActualizarRequest): Observable<UsuarioCuenta> {
    const idNormalizado = Number(id);

    if (!Number.isFinite(idNormalizado) || idNormalizado <= 0) {
      return throwError(() => new Error('Id de usuario invalido'));
    }

    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idNormalizado}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(map(payload => this.mapearUsuarioCuenta(payload)));
  }

  eliminarUsuario(id: number): Observable<void> {
    const idNormalizado = Number(id);

    if (!Number.isFinite(idNormalizado) || idNormalizado <= 0) {
      return throwError(() => new Error('Id de usuario invalido'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${idNormalizado}`, {
      headers: this.getAuthHeaders()
    });
  }

  resolverFotoPerfil(fotoPerfil: string | null | undefined): string | null {
    if (!fotoPerfil || !fotoPerfil.trim()) {
      return null;
    }

    const valor = fotoPerfil.trim();

    if (
      valor.startsWith('http://') ||
      valor.startsWith('https://') ||
      valor.startsWith('assets/') ||
      valor.startsWith('blob:') ||
      valor.startsWith('data:')
    ) {
      return valor;
    }

    const nombreArchivo = valor.split('/').pop()?.split('\\').pop() ?? valor;
    return `${this.uploadsUrl}/${encodeURIComponent(nombreArchivo)}`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private mapearUsuarioCuenta(payload: Record<string, unknown>): UsuarioCuenta {
    const id = Number(payload['id'] ?? payload['id_usuario'] ?? 0);

    const fechaRegistroRaw = payload['fechaRegistro']
      ?? payload['fecha_registro']
      ?? payload['fechaAlta']
      ?? payload['createdAt']
      ?? payload['created_at']
      ?? '';

    return {
      id: Number.isFinite(id) && id > 0 ? id : 0,
      nombre: (payload['nombre'] ?? '').toString(),
      email: (payload['email'] ?? '').toString(),
      fechaRegistro: fechaRegistroRaw ? fechaRegistroRaw.toString() : '',
      fotoPerfil: (payload['fotoPerfil'] ?? payload['foto_perfil'] ?? null) as string | null,
      biografia: (payload['biografia'] ?? payload['biografia_usuario'] ?? null) as string | null,
      rol: (payload['rol'] ?? '').toString() || undefined
    };
  }
}
