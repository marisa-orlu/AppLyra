import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro } from '../interfaces/libroDTO';
import { LibroCrear } from '../interfaces/libro-crear';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private apiUrl = 'http://localhost:8080/libros';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  crearLibro(data: LibroCrear): Observable<Libro> {
    return this.http.post<Libro>(this.apiUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerPorId(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerTodos(): Observable<Libro[]> {
    return this.http.get<Libro[]>(this.apiUrl, {
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
}
