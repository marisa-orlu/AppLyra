import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Libro } from '../interfaces/libroDTO';
import { LibroCrear } from '../interfaces/libro-crear';
import { AuthService } from './auth.service';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private apiUrl = 'http://localhost:8080/libros';
  private uploadsUrl = 'http://localhost:8080/uploads';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  crearLibro(data: LibroCrear, file: File): Observable<Libro> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);

    return this.http.post<Libro>(this.apiUrl, formData, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerPorId(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerTodos(page = 0, size = 15): Observable<PageResponse<Libro>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Libro>>(this.apiUrl, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  actualizarLibro(id: number, data: LibroCrear): Observable<Libro> {
    return this.http.put<Libro>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarLibro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  buscarPorTitulo(titulo: string): Observable<Libro[]> {
    const params = new HttpParams().set('titulo', titulo);
    return this.http.get<Libro[]>(`${this.apiUrl}/buscar/titulo`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  buscarPorAutor(autor: string): Observable<Libro[]> {
    const params = new HttpParams().set('autor', autor);
    return this.http.get<Libro[]>(`${this.apiUrl}/buscar/autor`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  buscarPorGenero(genero: string): Observable<Libro[]> {
    const params = new HttpParams().set('genero', genero);
    return this.http.get<Libro[]>(`${this.apiUrl}/buscar/genero`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  buscarPorAnio(anio: number): Observable<Libro[]> {
    const params = new HttpParams().set('anio', anio);
    return this.http.get<Libro[]>(`${this.apiUrl}/buscar/anio`, {
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

  resolverPortada(portada: unknown, portadaDefault: string): string {
    if (typeof portada !== 'string' || !portada.trim()) {
      return portadaDefault;
    }

    const valor = portada.trim();

    if (valor.startsWith('http://') || valor.startsWith('https://') || valor.startsWith('assets/')) {
      return valor;
    }

    const nombreArchivo = valor.split('/').pop()?.split('\\').pop() ?? valor;
    return `${this.uploadsUrl}/${encodeURIComponent(nombreArchivo)}`;
  }

  obtenerPortadaSegura(portada: unknown, portadaDefault: string): Observable<string> {
    const url = this.resolverPortada(portada, portadaDefault);

    if (!url.startsWith(this.uploadsUrl)) {
      return of(url);
    }

    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(() => of(portadaDefault))
    );
  }

  liberarObjectUrl(url: string | null | undefined, portadaDefault: string): void {
    if (!url || url === portadaDefault || !url.startsWith('blob:')) {
      return;
    }

    URL.revokeObjectURL(url);
  }
}
