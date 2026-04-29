import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PrestamoUsuarioLibro } from '../interfaces/Model/prestamoUsuarioLibro';

export interface PrestamoCrearDto {
  idDuenio: number;
  idSolicitante: number;
  idLibro: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private apiUrl = 'http://localhost:8080/prestamos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  crearPrestamo(idDuenio: number, idSolicitante: number, idLibro: number): Observable<PrestamoUsuarioLibro> {
    const payload: PrestamoCrearDto = { idDuenio, idSolicitante, idLibro };
    return this.http.post<PrestamoUsuarioLibro>(this.apiUrl, payload, { headers: this.getAuthHeaders() });
  }

  obtenerPorDuenio(idDuenio: number) {
    return this.http.get<PrestamoUsuarioLibro[]>(`${this.apiUrl}/duenio/${idDuenio}`, { headers: this.getAuthHeaders() });
  }

  obtenerPorSolicitante(idSolicitante: number) {
    return this.http.get<PrestamoUsuarioLibro[]>(`${this.apiUrl}/solicitante/${idSolicitante}`, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
