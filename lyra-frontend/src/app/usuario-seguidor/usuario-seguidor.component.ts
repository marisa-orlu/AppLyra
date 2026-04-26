import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioCuenta } from '../interfaces/usuario-cuenta';
import { UsuarioSeguidor } from '../interfaces/Model/usuarioSeguidor';

export interface AmigoVista {
  usuario: UsuarioCuenta;
  fechaSeguimiento: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioSeguidorService {

  private readonly apiUrl = 'http://localhost:8080/seguidores';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  obtenerSeguidos(idSeguidor: number): Observable<UsuarioSeguidor[]> {
    return this.http.get<UsuarioSeguidor[]>(
      `${this.apiUrl}/seguidor/${idSeguidor}`,
      { headers: this.getAuthHeaders() }
    );
  }

  obtenerSeguidores(idUsuario: number): Observable<UsuarioSeguidor[]> {
    return this.http.get<UsuarioSeguidor[]>(
      `${this.apiUrl}/usuario/${idUsuario}`,
      { headers: this.getAuthHeaders() }
    );
  }

  obtenerAmigosUsuario(idSeguidor: number): Observable<AmigoVista[]> {
    return this.obtenerSeguidos(idSeguidor).pipe(
      switchMap(relaciones => {
        if (!relaciones.length) {
          return of([]);
        }

        return forkJoin(
          relaciones.map(relacion =>
            this.usuarioService.obtenerPorId(relacion.id_usuario).pipe(
              map(usuario => ({
                usuario,
                fechaSeguimiento: relacion.fecha
              }))
            )
          )
        );
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
