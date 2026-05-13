import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface LibroUsuarioDto {
  id?: number;
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

export interface LibroUsuarioCrearDto {
  idUsuario: number;
  id_libro: number;
  estado: string;
}

export interface EditarLibroUsuarioDto {
  estado?: number | null;
  isPrestamo?: boolean | null;
  puntuacion?: number | null;
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

  obtenerTop5Puntuacion(idUsuario: number): Observable<LibroUsuarioDto[]> {
    return this.http.get<LibroUsuarioDto[]>(`${this.apiUrl}/${idUsuario}/libros/top5-puntuacion`, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarDeBiblioteca(idLibroUsuario: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idLibroUsuario}`, {
      headers: this.getAuthHeaders()
    });
  }

  anadirABiblioteca(idUsuario: number, idLibro: number, estado = 'PENDIENTE'): Observable<LibroUsuarioDto> {
    const payload: LibroUsuarioCrearDto = {
      idUsuario,
      id_libro: idLibro,
      estado
    };

    return this.http.post<LibroUsuarioDto>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarPuntuacion(idLibroUsuario: number, puntuacion: number): Observable<LibroUsuarioDto> {
    const params = new HttpParams().set('puntuacion', puntuacion);

    return this.http.put<LibroUsuarioDto>(`${this.apiUrl}/${idLibroUsuario}/puntuacion`, null, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  editarLibroUsuario(idLibroUsuario: number, data: EditarLibroUsuarioDto): Observable<LibroUsuarioDto> {
    const payload: Record<string, unknown> = {};

    if (data.estado !== undefined && data.estado !== null) {
      payload['estado'] = Number(data.estado);
    }

    if (data.isPrestamo !== undefined && data.isPrestamo !== null) {
      const prestamo = Boolean(data.isPrestamo);
      payload['isPrestamo'] = prestamo;
      payload['is_prestamo'] = prestamo;
    }

    if (data.puntuacion !== undefined) {
      payload['puntuacion'] = data.puntuacion;
    }

    console.log('[BibliotecaService] PUT /biblioteca/{idLibroUsuario} payload', {
      idLibroUsuario,
      dtoOriginal: data,
      payloadFinal: payload
    });

    return this.http.put<LibroUsuarioDto>(`${this.apiUrl}/${idLibroUsuario}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarEstado(idLibroUsuario: number, estado: string): Observable<LibroUsuarioDto> {
    const estadoNormalizado = (estado || 'PENDIENTE').toUpperCase();
    const valorEstado = this.obtenerValorEstado(estadoNormalizado);

    const params = new HttpParams()
      .set('estado', estadoNormalizado)
      .set('valor', valorEstado)
      .set('estado.valor', valorEstado);

    const body = {
      estado: estadoNormalizado,
      valor: valorEstado
    };

    return this.http.put<LibroUsuarioDto>(`${this.apiUrl}/${idLibroUsuario}/estado`, body, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  actualizarPrestamo(idLibroUsuario: number, prestamo: boolean): Observable<LibroUsuarioDto> {
    const params = new HttpParams().set('prestamo', prestamo);

    return this.http.put<LibroUsuarioDto>(`${this.apiUrl}/${idLibroUsuario}/prestamo`, null, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private obtenerValorEstado(estado: string): number {
    switch (estado) {
      case 'LEYENDO':
        return 1;
      case 'LEIDO':
        return 2;
      case 'PENDIENTE':
      default:
        return 0;
    }
  }
}
