import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface LibroUsuarioDto {
  id_libro_usuario?: number;
  idLibroUsuario?: number;
  id_usuario?: number;
  idUsuario?: number;
  id_libro?: number;
  idLibro?: number;
  estado?: string | null;
  fecha_agregacion?: string | null;
  fechaAgregacion?: string | null;
  is_prestamo?: boolean | null;
  isPrestamo?: boolean | null;
  puntuacion?: number | null;
  titulo_libro?: string;
  tituloLibro?: string;
  titulo?: string;
  autor?: string;
  genero?: string | null;
  portada?: string | null;
  usuario?: {
    id_usuario?: number;
    id?: number;
  };
  libro?: {
    id_libro?: number;
    id?: number;
    titulo_libro?: string;
    titulo?: string;
    autor?: string;
    genero?: string | null;
    portada?: string | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BibliotecaService {
  private apiUrl = 'http://localhost:8080/biblioteca';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  obtenerBiblioteca(idUsuario: number): Observable<LibroUsuarioDto[]> {
    return this.http.get<LibroUsuarioDto[]>(`${this.apiUrl}/usuario/${idUsuario}`, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarDeBiblioteca(idLibroUsuario: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idLibroUsuario}`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
