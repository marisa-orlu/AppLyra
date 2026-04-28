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

  anadirSeguidor(idSeguidor: number, idUsuario: number) {
    const payload: Record<string, unknown> = {
      idSeguidor,
      idUsuario
    };

    return this.http.post<UsuarioSeguidor>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    });
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

        const relacionesValidas = relaciones
          .map(relacion => ({
            relacion,
            idUsuario: this.extraerIdUsuario(relacion)
          }))
          .filter((item): item is { relacion: UsuarioSeguidor; idUsuario: number } => item.idUsuario !== null);

        if (!relacionesValidas.length) {
          return of([]);
        }

        return forkJoin(
          relacionesValidas.map(({ relacion, idUsuario }) =>
            this.usuarioService.obtenerPorId(idUsuario).pipe(
              map(usuario => ({
                usuario,
                fechaSeguimiento: this.extraerFechaSeguimiento(relacion)
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

  private extraerIdUsuario(relacion: UsuarioSeguidor): number | null {
    const relacionAny = relacion as unknown as Record<string, unknown>;
    const candidatos = [
      relacionAny['id_usuario'],
      relacionAny['idUsuario'],
      relacionAny['usuario_id'],
      relacionAny['usuarioId'],
      relacionAny['idSeguidor']
    ];

    for (const candidato of candidatos) {
      const id = Number(candidato);
      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    }

    return null;
  }

  private extraerFechaSeguimiento(relacion: UsuarioSeguidor): string {
    const relacionAny = relacion as unknown as Record<string, unknown>;
    const candidatos = [
      relacionAny['fecha'],
      relacionAny['fechaSeguimiento'],
      relacionAny['createdAt'],
      relacionAny['created_at']
    ];

    for (const candidato of candidatos) {
      if (typeof candidato === 'string' && candidato.trim()) {
        return candidato;
      }

      if (candidato instanceof Date) {
        return candidato.toISOString();
      }
    }

    return '';
  }
}
