import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioCuenta } from '../../interfaces/usuario-cuenta';
import { AmigoVista, UsuarioSeguidorService } from '../../usuario-seguidor/usuario-seguidor.component';
import { LibrosService } from '../../services/libros.service';
import { BibliotecaService, LibroUsuarioDto } from '../../services/biblioteca.service';
import { PrestamosService } from '../../services/prestamos.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface LibroBibliotecaVista {
    idLibroUsuario: number;
    idLibro: number;
    titulo: string;
    autor: string;
    genero: string;
    portada: string;
    disponible?: boolean;
}

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
    filtroAmigos = '';
    filterVisible = false;

    amigoSeleccionado: AmigoVista | null = null;
    mostrarModal = false;
    cargandoBiblioteca = false;
    errorBiblioteca = '';
    librosBiblioteca: LibroBibliotecaVista[] = [];
    filtroLibroBiblioteca = '';
    filtroAutorBiblioteca = '';
    readonly portadaDefault = 'assets/portadas/quijote.jpg';
    private readonly objectUrlsBiblioteca: string[] = [];

    constructor(
        private authService: AuthService,
        private usuarioSeguidorService: UsuarioSeguidorService,
        private usuarioService: UsuarioService,
        private librosService: LibrosService,
        private bibliotecaService: BibliotecaService
        ,
        private prestamosService: PrestamosService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.cargarAmigos();
    }

    ngOnDestroy(): void {
        this.limpiarObjectUrlsBiblioteca();
    }

    irABibliotecaAmigo(amigo: AmigoVista): void {
        if (!amigo.usuario.id || amigo.usuario.id <= 0) {
            return;
        }

        this.amigoSeleccionado = amigo;
        this.mostrarModal = true;
        this.cargarBibliotecaAmigo(amigo.usuario.id);
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.amigoSeleccionado = null;
        this.errorBiblioteca = '';
        this.librosBiblioteca = [];
        this.filtroLibroBiblioteca = '';
        this.filtroAutorBiblioteca = '';
        this.cargandoBiblioteca = false;
        this.limpiarObjectUrlsBiblioteca();
    }

    get librosBibliotecaFiltrados(): LibroBibliotecaVista[] {
        const filtroTitulo = this.filtroLibroBiblioteca.trim().toLowerCase();
        const filtroAutor = this.filtroAutorBiblioteca.trim().toLowerCase();

        return this.librosBiblioteca.filter(libro => {
            const coincideTitulo = !filtroTitulo || libro.titulo.toLowerCase().includes(filtroTitulo);
            const coincideAutor = !filtroAutor || libro.autor.toLowerCase().includes(filtroAutor);
            return coincideTitulo && coincideAutor;
        });
    }

    get hayFiltrosBibliotecaActivos(): boolean {
        return !!(this.filtroLibroBiblioteca.trim() || this.filtroAutorBiblioteca.trim());
    }

    limpiarFiltrosBiblioteca(): void {
        this.filtroLibroBiblioteca = '';
        this.filtroAutorBiblioteca = '';
    }

    trackByLibroBiblioteca(_: number, libro: LibroBibliotecaVista): number {
        return libro.idLibroUsuario > 0 ? libro.idLibroUsuario : libro.idLibro;
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

    get amigosFiltrados(): AmigoVista[] {
        const termino = this.filtroAmigos.trim().toLowerCase();

        if (!termino) {
            return this.amigos;
        }

        return this.amigos.filter(amigo => {
            const nombre = (amigo.usuario?.nombre ?? '').toString().toLowerCase();
            const email = (amigo.usuario?.email ?? '').toString().toLowerCase();

            return nombre.includes(termino) || email.includes(termino);
        });
    }

    limpiarFiltroAmigos(): void {
        this.filtroAmigos = '';
    }

    toggleFilter(): void {
        this.filterVisible = !this.filterVisible;
        if (!this.filterVisible) {
            this.limpiarFiltroAmigos();
        }
    }

    private cargarBibliotecaAmigo(idUsuario: number): void {
        this.cargandoBiblioteca = true;
        this.errorBiblioteca = '';
        this.librosBiblioteca = [];
        this.limpiarObjectUrlsBiblioteca();

        this.bibliotecaService.obtenerBiblioteca(idUsuario).subscribe({
            next: (data: LibroUsuarioDto[]) => {
                const lista = Array.isArray(data) ? data : [];
                this.librosBiblioteca = lista.map(item => this.mapearLibro(item));

                // Resolver portadas y completar datos faltantes (cuando el DTO no contiene el objeto libro completo)
                this.librosBiblioteca.forEach(libro => {
                    // Si faltan título/autor y tenemos idLibro, solicitar detalles del libro
                    if ((libro.titulo === 'Sin titulo' || libro.autor === 'Autor desconocido') && libro.idLibro > 0) {
                        this.librosService.obtenerPorId(libro.idLibro).subscribe(lib => {
                            libro.titulo = (lib.titulo ?? libro.titulo).toString();
                            libro.autor = (lib.autor ?? libro.autor).toString();
                            libro.genero = (lib.genero ?? libro.genero ?? 'Sin genero').toString();
                            libro.portada = this.librosService.resolverPortada(lib.portada ?? libro.portada, this.portadaDefault);

                            // resolver la portada segura para la nueva portada
                            this.librosService.obtenerPortadaSegura(libro.portada, this.portadaDefault).subscribe(url => {
                                if (url.startsWith('blob:')) {
                                    this.objectUrlsBiblioteca.push(url);
                                }
                                libro.portada = url;
                            });
                        }, () => {
                            // ignore errors fetching libro
                        });
                    } else {
                        this.librosService.obtenerPortadaSegura(libro.portada, this.portadaDefault).subscribe(url => {
                            if (url.startsWith('blob:')) {
                                this.objectUrlsBiblioteca.push(url);
                            }
                            libro.portada = url;
                        });
                    }
                });

                this.cargandoBiblioteca = false;
            },
            error: (err: HttpErrorResponse) => {
                this.cargandoBiblioteca = false;
                this.errorBiblioteca = this.obtenerMensajeError(err, 'No se pudo cargar la biblioteca de este usuario.');
            }
        });
    }

    private mapearLibro(item: LibroUsuarioDto): LibroBibliotecaVista {
        const idLibroUsuario = Number(item.id_libro_usuario ?? item.idLibroUsuario ?? item.id ?? 0);
        const idLibro = Number(item.id_libro ?? item.idLibro ?? item.libro?.id_libro ?? item.libro?.id ?? 0);

        const titulo = (
            item.libro?.titulo_libro ??
            item.libro?.titulo ??
            item.titulo_libro ??
            item.tituloLibro ??
            item.titulo ??
            'Sin titulo'
        ).toString();

        const autor = (item.libro?.autor ?? item.autor ?? 'Autor desconocido').toString();
        const genero = (item.libro?.genero ?? item.genero ?? 'Sin genero').toString();
        const portada = this.librosService.resolverPortada(item.libro?.portada ?? item.portada, this.portadaDefault);

        const prestamoFlag = Boolean(item.isPrestamo ?? item.is_prestamo ?? false);
        const disponible = prestamoFlag; // Mostrar botón solo si el propietario marcó el libro como prestable

        return {
            idLibroUsuario: Number.isFinite(idLibroUsuario) ? idLibroUsuario : 0,
            idLibro: Number.isFinite(idLibro) ? idLibro : 0,
            titulo,
            autor,
            genero,
            portada,
            disponible: disponible
        };
    }

    // Estado local para confirmar solicitudes
    confirmingSolicitudId: number | null = null;

    solicitarPrestamo(libro: LibroBibliotecaVista): void {
        if (!this.amigoSeleccionado || !this.amigoSeleccionado.usuario?.id) {
            return;
        }

        // Abrir confirmación mínima
        this.confirmingSolicitudId = libro.idLibro;
    }

    cancelarSolicitud(): void {
        this.confirmingSolicitudId = null;
    }

    confirmarSolicitud(libro: LibroBibliotecaVista): void {
        const idSolicitante = this.authService.getUserId();
        const idDuenio = this.amigoSeleccionado?.usuario?.id;

        if (!idSolicitante || !idDuenio) {
            this.snackBar.open('No se ha detectado el usuario autenticado.', 'Cerrar', { duration: 3000 });
            this.confirmingSolicitudId = null;
            return;
        }

        this.prestamosService.crearPrestamo(idDuenio, idSolicitante, libro.idLibro).subscribe({
            next: () => {
                this.snackBar.open('Solicitud de préstamo enviada.', 'Cerrar', { duration: 3000 });
                this.confirmingSolicitudId = null;
            },
            error: () => {
                this.snackBar.open('Error al enviar la solicitud.', 'Cerrar', { duration: 3000 });
                this.confirmingSolicitudId = null;
            }
        });
    }

    private limpiarObjectUrlsBiblioteca(): void {
        this.objectUrlsBiblioteca.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
        this.objectUrlsBiblioteca.length = 0;
    }

    private parseBoolean(value: unknown): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') {
            const v = value.trim().toLowerCase();
            return v === 'true' || v === '1' || v === 'yes' || v === 'si';
        }
        return false;
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