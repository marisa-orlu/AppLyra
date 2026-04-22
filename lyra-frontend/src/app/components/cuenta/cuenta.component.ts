import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioActualizarRequest, UsuarioCuenta } from '../../interfaces/usuario-cuenta';

@Component({
  selector: 'app-cuenta',
  standalone: false,
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css']
})
export class CuentaComponent implements OnInit, OnDestroy {
  cargando = true;
  guardando = false;
  error = '';
  exito = '';

  usuario: UsuarioCuenta | null = null;
  fotoPerfilUrl: string | null = null;

  mostrarEditor = false;
  private fotoPreviewTemporalUrl: string | null = null;

  formEdicion = {
    nombre: '',
    email: '',
    biografia: '',
    fotoPerfil: ''
  };

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarCuenta();
  }

  ngOnDestroy(): void {
    this.limpiarPreviewTemporal();
  }

  get inicialesUsuario(): string {
    const nombre = this.usuario?.nombre?.trim();

    if (!nombre) {
      return 'U';
    }

    const partes = nombre.split(' ').filter(Boolean);

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  get usernameGenerado(): string {
    if (this.usuario?.email?.includes('@')) {
      return this.usuario.email.split('@')[0];
    }

    return `usuario${this.usuario?.id ?? ''}`;
  }

  get fechaRegistroFormateada(): string {
    const valor = (this.usuario?.fechaRegistro ?? '').trim();

    if (!valor) {
      return 'Sin fecha disponible';
    }

    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (soloFecha) {
      const [, anio, mes, dia] = soloFecha;
      return `${dia}/${mes}/${anio}`;
    }

    const parsed = new Date(valor);
    if (Number.isNaN(parsed.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  }

  abrirEditor(): void {
    if (!this.usuario) {
      return;
    }

    this.error = '';
    this.exito = '';
    this.limpiarPreviewTemporal();

    this.formEdicion = {
      nombre: this.usuario.nombre ?? '',
      email: this.usuario.email ?? '',
      biografia: this.usuario.biografia ?? '',
      fotoPerfil: this.usuario.fotoPerfil ?? ''
    };

    this.mostrarEditor = true;
  }

  cerrarEditor(): void {
    this.mostrarEditor = false;
    this.guardando = false;
    this.limpiarPreviewTemporal();
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.limpiarPreviewTemporal();

    if (!file) {
      return;
    }

    this.formEdicion.fotoPerfil = file.name;
    this.fotoPreviewTemporalUrl = URL.createObjectURL(file);
    this.fotoPerfilUrl = this.fotoPreviewTemporalUrl;
  }

  guardarCambios(): void {
    const idUsuario = this.authService.getUserId();

    if (!idUsuario) {
      this.error = 'No se encontro el usuario autenticado. Vuelve a iniciar sesion.';
      return;
    }

    const nombre = this.formEdicion.nombre.trim();
    const email = this.formEdicion.email.trim().toLowerCase();

    if (!nombre || !email) {
      this.error = 'Nombre y email son obligatorios.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.exito = '';

    const payload: UsuarioActualizarRequest = {
      nombre,
      email,
      biografia: this.formEdicion.biografia.trim() || null,
      fotoPerfil: this.formEdicion.fotoPerfil.trim() || null
    };

    this.usuarioService.actualizarUsuario(idUsuario, payload).subscribe({
      next: (usuarioActualizado) => {
        this.guardando = false;
        this.usuario = usuarioActualizado;
        this.actualizarFotoPerfil(usuarioActualizado.fotoPerfil ?? null);
        this.exito = 'Datos actualizados correctamente.';
        this.mostrarEditor = false;
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;

        if (err.status === 404 || err.status === 405) {
          this.error = 'No se pudo guardar porque el endpoint PUT /usuarios/{id} aun no esta disponible en backend.';
          return;
        }

        const backendMessage = (err.error as { message?: string; error?: string } | null)?.message
          ?? (err.error as { message?: string; error?: string } | null)?.error;

        this.error = backendMessage ?? 'No se pudieron guardar los cambios.';
      }
    });
  }

  private cargarCuenta(): void {
    const idUsuario = this.authService.getUserId();

    if (!idUsuario) {
      this.cargando = false;
      this.error = 'No se encontro el id del usuario. Cierra sesion y vuelve a iniciar.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.usuarioService.obtenerPorId(idUsuario).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.actualizarFotoPerfil(usuario.fotoPerfil ?? null);
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        const backendMessage = (err.error as { message?: string; error?: string } | null)?.message
          ?? (err.error as { message?: string; error?: string } | null)?.error;
        this.error = backendMessage ?? 'No se pudo cargar la cuenta.';
      }
    });
  }

  private actualizarFotoPerfil(fotoPerfil: string | null): void {
    if (this.fotoPreviewTemporalUrl) {
      this.fotoPerfilUrl = this.fotoPreviewTemporalUrl;
      return;
    }

    this.fotoPerfilUrl = this.usuarioService.resolverFotoPerfil(fotoPerfil);
  }

  private limpiarPreviewTemporal(): void {
    if (this.fotoPreviewTemporalUrl) {
      URL.revokeObjectURL(this.fotoPreviewTemporalUrl);
      this.fotoPreviewTemporalUrl = null;

      this.fotoPerfilUrl = this.usuarioService.resolverFotoPerfil(this.usuario?.fotoPerfil ?? null);
    }
  }
}
