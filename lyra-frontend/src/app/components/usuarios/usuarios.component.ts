import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioActualizarRequest, UsuarioCuenta } from '../../interfaces/usuario-cuenta';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  cargando = false;
  guardando = false;
  eliminandoId: number | null = null;
  fotoPerfilUrl: string | null = null;


  error = '';
  exito = '';

  usuarios: UsuarioCuenta[] = [];
  filtroNombre = '';
  filtroEmail = '';

  mostrarEditor = false;
  mostrarConfirmacionBorrado = false;

  usuarioEditando: UsuarioCuenta | null = null;
  usuarioAEliminar: UsuarioCuenta | null = null;

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
    if (!this.authService.isAdmin()) {
      this.error = 'Solo los usuarios ADMIN pueden gestionar usuarios.';
      return;
    }

    this.cargarUsuarios();
  }

  get usuariosFiltrados(): UsuarioCuenta[] {
    const nombre = this.filtroNombre.trim().toLowerCase();
    const email = this.filtroEmail.trim().toLowerCase();

    return this.usuarios.filter(usuario => {
      const nombreUsuario = (usuario.nombre ?? '').toLowerCase();
      const emailUsuario = (usuario.email ?? '').toLowerCase();
      const coincideNombre = !nombre || nombreUsuario.includes(nombre);
      const coincideEmail = !email || emailUsuario.includes(email);
      return coincideNombre && coincideEmail;
    });
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.filtroNombre.trim() || this.filtroEmail.trim());
  }

  trackByUsuario(_: number, usuario: UsuarioCuenta): number {
    return usuario.id;
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroEmail = '';
  }

  abrirEditor(usuario: UsuarioCuenta): void {
    this.error = '';
    this.exito = '';
    this.usuarioEditando = usuario;
    this.formEdicion = {
      nombre: usuario.nombre ?? '',
      email: usuario.email ?? '',
      biografia: usuario.biografia ?? '',
      fotoPerfil: usuario.fotoPerfil ?? ''
    };
    this.mostrarEditor = true;
  }

  cerrarEditor(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarEditor = false;
    this.usuarioEditando = null;
  }

  abrirConfirmacionBorrado(usuario: UsuarioCuenta): void {
    this.error = '';
    this.exito = '';
    this.usuarioAEliminar = usuario;
    this.mostrarConfirmacionBorrado = true;
  }

  cerrarConfirmacionBorrado(): void {
    if (this.eliminandoId !== null) {
      return;
    }

    this.mostrarConfirmacionBorrado = false;
    this.usuarioAEliminar = null;
  }

  confirmarBorrado(): void {
    if (!this.usuarioAEliminar || this.eliminandoId !== null) {
      return;
    }

    const usuario = this.usuarioAEliminar;
    const idActual = this.authService.getUserId();

    if (idActual && idActual === usuario.id) {
      this.error = 'No puedes eliminar tu propio usuario desde esta pantalla.';
      this.cerrarConfirmacionBorrado();
      return;
    }

    this.eliminandoId = usuario.id;
    this.error = '';
    this.exito = '';

    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(item => item.id !== usuario.id);
        this.exito = `Usuario ${usuario.nombre} eliminado correctamente.`;
        this.eliminandoId = null;
        this.cerrarConfirmacionBorrado();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.construirMensajeError(err, 'No se pudo eliminar el usuario.');
        this.eliminandoId = null;
      }
    });
  }

  guardarCambios(): void {
    if (!this.usuarioEditando || this.guardando) {
      return;
    }

    const nombre = this.formEdicion.nombre.trim();
    const email = this.formEdicion.email.trim().toLowerCase();

    if (!nombre || !email) {
      this.error = 'Nombre y email son obligatorios.';
      return;
    }

    const payload: UsuarioActualizarRequest = {
      nombre,
      email,
      biografia: this.formEdicion.biografia.trim() || null,
      fotoPerfil: this.formEdicion.fotoPerfil.trim() || null
    };

    this.guardando = true;
    this.error = '';
    this.exito = '';

    this.usuarioService.actualizarUsuario(this.usuarioEditando.id, payload).subscribe({
      next: (usuarioActualizado) => {
        this.guardando = false;
        this.usuarios = this.usuarios.map(item =>
          item.id === usuarioActualizado.id ? usuarioActualizado : item
        );
        this.exito = `Usuario ${usuarioActualizado.nombre} actualizado correctamente.`;
        this.cerrarEditor();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = this.construirMensajeError(err, 'No se pudo actualizar el usuario.');
      }
    });
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

  private cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.construirMensajeError(err, 'No se pudo cargar el listado de usuarios.');
        this.cargando = false;
      }
    });
  }

  private construirMensajeError(err: HttpErrorResponse, fallback: string): string {
    const backendError = err.error as { message?: string; error?: string } | string | null;

    if (typeof backendError === 'string' && backendError.trim()) {
      return backendError;
    }

    if (backendError && typeof backendError === 'object') {
      return backendError.message ?? backendError.error ?? fallback;
    }

    return fallback;
  }

  obtenerFotoPerfil(usuario: UsuarioCuenta): string {
    return this.usuarioService.resolverFotoPerfil(usuario.fotoPerfil) ?? '/assets/logo/default.jpg';
  }
}