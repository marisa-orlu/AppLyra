import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { LibrosService } from '../../services/libros.service';
import { BibliotecaService } from '../../services/biblioteca.service';
import { UsuarioSeguidorService } from '../../usuario-seguidor/usuario-seguidor.component';
import { UsuarioCuenta } from '../../interfaces/usuario-cuenta';
import { Libro } from '../../interfaces/libroDTO';

@Component({
    selector: 'app-explorar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './explorar.component.html',
    styleUrls: ['./explorar.component.css']
})
export class ExplorarComponent implements OnInit, OnDestroy {
    searchTarget: 'usuario' | 'libro' = 'libro';
    usuarioField: 'nombre' | 'email' = 'nombre';
    libroField: 'titulo' | 'autor' | 'anio' | 'genero' = 'titulo';
    query = '';

    private todosLosUsuarios: UsuarioCuenta[] = [];
    resultados: Array<any> = [];
    loading = false;

    // fallback local como en listado-libros
    portadaDefault = 'assets/portadas/quijote.jpg';

    // similar a listado-libros: maneja error de imagen de portada
    onPortadaError(event: Event) {
        const img = event.target as HTMLImageElement;
        if (!img) return;
        if (img.src.includes(this.portadaDefault)) {
            img.onerror = null;
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            return;
        }
        img.src = this.portadaDefault;
    }

    // para foto de usuario: al haber fallo, borramos la URL resuelta para mostrar las iniciales (fallback)
    onFotoError(event: Event, item: any) {
        const img = event.target as HTMLImageElement;
        if (!img) return;
        img.onerror = null;
        // limpiar la URL calculada para que el ngIf muestre el fallback (iniciales)
        if (item) {
            item.fotoPerfilUrl = null;
        } else {
            img.src = '';
        }
    }

    private querySubject = new Subject<string>();
    private subs = new Subscription();
    private objectUrls: string[] = [];

    constructor(
        private usuarioService: UsuarioService,
        private librosService: LibrosService,
        private bibliotecaService: BibliotecaService,
        private usuarioSeguidorService: UsuarioSeguidorService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        // Pre-carga usuarios una sola vez
        this.usuarioService.obtenerTodos().subscribe(list => {
            this.todosLosUsuarios = list;
        });

        // Pipe de búsqueda con debounce para libros
        this.subs.add(
            this.querySubject.pipe(
                debounceTime(300),
                distinctUntilChanged()
            ).subscribe(q => this.ejecutarBusqueda(q))
        );
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
        this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
        this.objectUrls.length = 0;
    }

    // Llamado en (ngModelChange) del input
    onQueryChange() {
        if (!this.query.trim()) {
            this.resultados = [];
            return;
        }
        if (this.searchTarget === 'usuario') {
            // Filtrado local: instantáneo, sin debounce
            this.filtrarUsuariosLocal(this.query.trim());
        } else {
            // Libros: debounce para no saturar el backend
            this.querySubject.next(this.query.trim());
        }
    }

    // Botón buscar — fuerza inmediatamente
    onSearch() {
        const q = this.query.trim();
        if (!q) {
            this.resultados = [];
            this.snackBar.open('Introduce un término de búsqueda', 'Cerrar', { duration: 2000 });
            return;
        }
        this.ejecutarBusqueda(q);
    }

    // Al cambiar el tipo (libro/usuario) o el subcampo, re-busca si hay query
    onTargetChange() {
        this.resultados = [];
        if (this.query.trim()) this.onQueryChange();
    }

    private filtrarUsuariosLocal(q: string) {
        const lower = q.toLowerCase();
        this.resultados = this.todosLosUsuarios
            .filter(u => {
                const campo = this.usuarioField === 'nombre' ? u.nombre : u.email;
                return (campo || '').toLowerCase().includes(lower);
            })
            .map(u => ({
                ...u,
                // resolver foto perfil igual que en usuarios.component
                fotoPerfilUrl: this.usuarioService.resolverFotoPerfil(u.fotoPerfil) ?? null
            }));
    }

    private ejecutarBusqueda(q: string) {
        if (!q) { this.resultados = []; return; }

        if (this.searchTarget === 'usuario') {
            this.filtrarUsuariosLocal(q);
            return;
        }

        this.loading = true;
        const field = this.libroField;

        const ok = (arr: Libro[]) => {
            this.resultados = Array.isArray(arr) ? arr.map(item => ({ ...item })) : [];

            // liberar object URLs previas
            this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
            this.objectUrls.length = 0;

            // resolver y/o descargar portadas de forma segura
            this.resultados.forEach(lib => {
                const resolved = this.librosService.resolverPortada((lib as any).portada, this.portadaDefault);
                this.librosService.obtenerPortadaSegura(resolved, this.portadaDefault).subscribe(url => {
                    if (url.startsWith('blob:')) {
                        this.objectUrls.push(url);
                    }
                    lib.portadaUrl = url;
                });
            });

            this.loading = false;
        };
        const err = () => { this.loading = false; };

        if (field === 'titulo') {
            this.librosService.buscarPorTitulo(q).subscribe(ok, err);
        } else if (field === 'autor') {
            this.librosService.buscarPorAutor(q).subscribe(ok, err);
        } else if (field === 'genero') {
            this.librosService.buscarPorGenero(q).subscribe(ok, err);
        } else if (field === 'anio') {
            const anio = Number(q);
            if (!Number.isFinite(anio)) {
                this.snackBar.open('Introduce un año válido', 'Cerrar', { duration: 2000 });
                this.loading = false;
                return;
            }
            this.librosService.buscarPorAnio(anio).subscribe(ok, err);
        }
    }

    anadirAmigo(usuario: UsuarioCuenta) {
        const miId = this.authService.getUserId();
        if (!miId) { this.snackBar.open('No autenticado', 'Cerrar', { duration: 2000 }); return; }
        this.usuarioSeguidorService.anadirSeguidor(miId, usuario.id).subscribe(
            () => this.snackBar.open('Seguido', 'Cerrar', { duration: 2000 }),
            () => this.snackBar.open('Error al enviar solicitud', 'Cerrar', { duration: 2000 })
        );
    }

    anadirLibro(libro: Libro) {
        const miId = this.authService.getUserId();
        if (!miId) { this.snackBar.open('No autenticado', 'Cerrar', { duration: 2000 }); return; }
        const idLibro = (libro as any).id || (libro as any).id_libro || 0;
        if (!idLibro) { this.snackBar.open('Id de libro inválido', 'Cerrar', { duration: 2000 }); return; }
        this.bibliotecaService.anadirABiblioteca(miId, idLibro).subscribe(
            () => this.snackBar.open('Añadido a tu biblioteca', 'Cerrar', { duration: 2000 }),
            () => this.snackBar.open('Error al añadir libro', 'Cerrar', { duration: 2000 })
        );
    }
}