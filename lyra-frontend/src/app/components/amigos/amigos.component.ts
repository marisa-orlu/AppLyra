import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioCuenta } from '../../interfaces/usuario-cuenta';
import { AmigoVista, UsuarioSeguidorService } from '../../usuario-seguidor/usuario-seguidor.component';

@Component({
selector: 'app-amigos',
standalone: false,
templateUrl: './amigos.component.html',
styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {
cargando = true;
error = '';
amigos: AmigoVista[] = [];

constructor(
private authService: AuthService,
private usuarioSeguidorService: UsuarioSeguidorService,
private usuarioService: UsuarioService
) {}

ngOnInit(): void {
this.cargarAmigos();
}

cargarAmigos(): void {
const idUsuario = this.authService.getUserId();

if (!idUsuario) {
this.cargando = false;
this.error = 'No se encontro el usuario autenticado.';
return;
}

this.cargando = true;
this.error = '';

this.usuarioSeguidorService.obtenerAmigosUsuario(idUsuario).subscribe({
next: amigos => {
this.amigos = amigos;
this.cargando = false;
},
error: (err: HttpErrorResponse) => {
this.cargando = false;
this.error = this.obtenerMensajeError(err, 'No se pudo cargar la lista de amigos.');
}
});
}

obtenerFotoPerfil(usuario: UsuarioCuenta): string {
return this.usuarioService.resolverFotoPerfil(usuario.fotoPerfil) ?? '/assets/logo/default.jpg';
}

recortarBiografia(texto: string | null | undefined, limite: number = 30): string {
const palabras = (texto ?? '').trim().split(/\s+/).filter(Boolean);

if (palabras.length <= limite) {
return (texto ?? '').trim();
}

return palabras.slice(0, limite).join(' ') + '...';
}

formatearFecha(valor: string): string {
const fecha = (valor ?? '').trim();

if (!fecha) {
return 'Sin fecha';
}

const parsed = new Date(fecha);
if (Number.isNaN(parsed.getTime())) {
return fecha;
}

return new Intl.DateTimeFormat('es-ES', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
}).format(parsed);
}

trackByAmigo(_: number, item: AmigoVista): number {
return item.usuario.id;
}

private obtenerMensajeError(err: HttpErrorResponse, fallback: string): string {
const backendError = err.error as { message?: string; error?: string } | string | null;

if (typeof backendError === 'string' && backendError.trim()) {
return backendError;
}

if (backendError && typeof backendError === 'object') {
return backendError.message ?? backendError.error ?? fallback;
}

return fallback;
}
}