import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PrestamoUsuarioLibro } from '../interfaces/Model/prestamoUsuarioLibro';
import { map } from 'rxjs/operators';

type PrestamoDtoApi = {
  id?: number;
  idDuenio?: number;
  idSolicitante?: number;
  idLibro?: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado?: unknown;
};

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

  private mapearPrestamo(payload: Record<string, unknown> | null | undefined): PrestamoUsuarioLibro {
    const p = (payload ?? {}) as any as PrestamoDtoApi & Record<string, unknown>;

    const idPrestamo = Number((p as any).id_prestamo ?? p.id ?? 0);
    const idDuenio = Number((p as any).id_duenio ?? p.idDuenio ?? 0);
    const idSolicitante = Number((p as any).id_solicitante ?? p.idSolicitante ?? 0);
    const idLibro = Number((p as any).id_libro ?? p.idLibro ?? 0);

    const fechaInicio = ((p as any).fecha_inicio ?? p.fechaInicio ?? null) as string | null;
    const fechaFin = ((p as any).fecha_fin ?? p.fechaFin ?? null) as string | null;
    const estado = ((p as any).estado ?? null) as any;

    return {
      id_prestamo: Number.isFinite(idPrestamo) ? idPrestamo : 0,

      idDuenio: Number.isFinite(idDuenio) ? idDuenio : undefined,
      idSolicitante: Number.isFinite(idSolicitante) ? idSolicitante : undefined,
      id_duenio: Number.isFinite(idDuenio) ? idDuenio : undefined,
      id_solicitante: Number.isFinite(idSolicitante) ? idSolicitante : undefined,

      // La UI resolverá el libro real por id y rellenará título/portada.
      libro: {
        id_libro: Number.isFinite(idLibro) ? idLibro : 0,
        titulo_libro: '',
        autor: '',
        genero: null,
        anio_publicacion: null,
        sinopsis: null,
        portada: null,
        resenas: [],
        frases: [],
        usuarios_libro: [],
        prestamos: []
      },

      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      fechaInicio,
      fechaFin,
      estado
    };
  }

  crearPrestamo(idDuenio: number, idSolicitante: number, idLibro: number): Observable<PrestamoUsuarioLibro> {
    const payload: PrestamoCrearDto = { idDuenio, idSolicitante, idLibro };
    return this.http.post<Record<string, unknown>>(this.apiUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  obtenerPorDuenio(idDuenio: number): Observable<PrestamoUsuarioLibro[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.apiUrl}/duenio/${idDuenio}`, { headers: this.getAuthHeaders() })
      .pipe(map(lista => (Array.isArray(lista) ? lista : []).map(item => this.mapearPrestamo(item))));
  }

  obtenerPorSolicitante(idSolicitante: number): Observable<PrestamoUsuarioLibro[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.apiUrl}/solicitante/${idSolicitante}`, { headers: this.getAuthHeaders() })
      .pipe(map(lista => (Array.isArray(lista) ? lista : []).map(item => this.mapearPrestamo(item))));
  }

  aceptarPrestamo(idPrestamo: number): Observable<PrestamoUsuarioLibro> {
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idPrestamo}/aceptar`, null, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  rechazarPrestamo(idPrestamo: number): Observable<PrestamoUsuarioLibro> {
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idPrestamo}/rechazar`, null, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  // El solicitante solicita la devolución (marca pendiente de devolución)
  devolverPrestamo(idPrestamo: number): Observable<PrestamoUsuarioLibro> {
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idPrestamo}/pendiente-devolucion`, null, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  // El dueño confirma la devolución
  confirmarDevolucion(idPrestamo: number): Observable<PrestamoUsuarioLibro> {
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idPrestamo}/confirmar-devolucion`, null, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  cambiarEstado(idPrestamo: number, valor: number): Observable<PrestamoUsuarioLibro> {
    const body = { estado: valor };
    return this.http.put<Record<string, unknown>>(`${this.apiUrl}/${idPrestamo}`, body, { headers: this.getAuthHeaders() })
      .pipe(map(dto => this.mapearPrestamo(dto)));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
