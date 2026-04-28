import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioCuenta } from '../../interfaces/usuario-cuenta';
import { AmigoVista, UsuarioSeguidorService } from '../../usuario-seguidor/usuario-seguidor.component';
import { LibrosService } from '../../services/libros.service';
import { BibliotecaService, LibroUsuarioDto } from '../../services/biblioteca.service';

interface LibroBibliotecaVista {
    idLibroUsuario: number;
    idLibro: number;
    titulo: string;
    autor: string;
    genero: string;
    portada: string;
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

    private cargarBibliotecaAmigo(idUsuario: number): void {
        this.cargandoBiblioteca = true;
        this.errorBiblioteca = '';
        this.librosBiblioteca = [];
        this.limpiarObjectUrlsBiblioteca();

        this.bibliotecaService.obtenerBiblioteca(idUsuario).subscribe({
            next: (data: LibroUsuarioDto[]) => {
                const lista = Array.isArray(data) ? data : [];
                this.librosBiblioteca = lista.map(item => this.mapearLibro(item));

                this.librosBiblioteca.forEach(libro => {
                    this.librosService.obtenerPortadaSegura(libro.portada, this.portadaDefault).subscribe(url => {
                        if (url.startsWith('blob:')) {
                            this.objectUrlsBiblioteca.push(url);
                        }
                        libro.portada = url;
                    });
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

        return {
            idLibroUsuario: Number.isFinite(idLibroUsuario) ? idLibroUsuario : 0,
            idLibro: Number.isFinite(idLibro) ? idLibro : 0,
            titulo,
            autor,
            genero,
            portada
        };
    }

    private limpiarObjectUrlsBiblioteca(): void {
        this.objectUrlsBiblioteca.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
        this.objectUrlsBiblioteca.length = 0;
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