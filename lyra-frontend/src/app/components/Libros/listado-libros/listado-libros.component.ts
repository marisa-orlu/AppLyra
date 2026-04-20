import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LibrosService, PageResponse } from '../../../services/libros.service';
import { AuthService } from '../../../services/auth.service';
import { Libro } from '../../../interfaces/libroDTO';

interface LibroVista {
  id: number;
  titulo: string;
  autor: string;
  genero: string | null;
  portada: string | null;
}

@Component({
  selector: 'app-listado-libros',
  standalone: false,
  templateUrl: './listado-libros.component.html',
  styleUrl: './listado-libros.component.css'
})
export class ListadoLibrosComponent implements OnInit, OnDestroy {
  libros: LibroVista[] = [];
  cargando = false;
  error = '';
  esAdmin = false;
  mostrarConfirmacion = false;
  eliminando = false;
  libroAEliminar: LibroVista | null = null;
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  readonly pageSize = 15;
  paginaActual = 0;
  totalPaginas = 0;
  totalElementos = 0;
  private readonly objectUrls: string[] = [];

  constructor(
    private librosService: LibrosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.isAdmin();
    this.listarLibros();
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
    this.objectUrls.length = 0;
  }

  listarLibros(): void {
    this.cargarPagina(this.paginaActual);
  }

  irPaginaAnterior(): void {
    if (this.paginaActual <= 0 || this.cargando) {
      return;
    }

    this.cargarPagina(this.paginaActual - 1);
  }

  irPaginaSiguiente(): void {
    if (this.paginaActual >= this.totalPaginas - 1 || this.cargando) {
      return;
    }

    this.cargarPagina(this.paginaActual + 1);
  }

  private cargarPagina(page: number): void {
    this.cargando = true;
    this.error = '';

    this.librosService.obtenerTodos(page, this.pageSize).subscribe({
      next: (data: PageResponse<Libro>) => {
        this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
        this.objectUrls.length = 0;

        const respuesta = Array.isArray(data?.content) ? data.content : [];
        this.paginaActual = Number.isFinite(data?.number) ? data.number : page;
        this.totalPaginas = Number.isFinite(data?.totalPages) ? data.totalPages : 0;
        this.totalElementos = Number.isFinite(data?.totalElements) ? data.totalElements : respuesta.length;

        this.libros = respuesta.map((item: any) => ({
          id: item.id ?? item.id_libro ?? 0,
          titulo: item.titulo ?? item.titulo_libro ?? 'Sin titulo',
          autor: item.autor ?? 'Autor desconocido',
          genero: item.genero ?? null,
          portada: this.resolverPortada(item.portada)
        }));

        this.libros.forEach(libro => {
          this.librosService.obtenerPortadaSegura(libro.portada, this.portadaDefault).subscribe(url => {
            if (url.startsWith('blob:')) {
              this.objectUrls.push(url);
            }
            libro.portada = url;
          });
        });

        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los libros.';
        this.cargando = false;
      }
    });
  }

  trackByLibro(_: number, libro: LibroVista): number {
    return libro.id;
  }

  irAnadirLibro(): void {
    this.router.navigate(['/libros/nuevo']);
  }

  irEditarLibro(id: number): void {
    this.router.navigate(['/libros/editar', id]);
  }

  onPortadaError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes(this.portadaDefault)) {
      img.onerror = null;
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      return;
    }

    img.src = this.portadaDefault;
  }

  abrirConfirmacionEliminar(libro: LibroVista): void {
    this.libroAEliminar = libro;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacion = false;
    this.libroAEliminar = null;
    this.eliminando = false;
  }

  confirmarEliminar(): void {
    if (!this.libroAEliminar || this.eliminando) {
      return;
    }

    this.eliminando = true;
    this.error = '';

    this.librosService.eliminarLibro(this.libroAEliminar.id).subscribe({
      next: () => {
        const esUltimoDePagina = this.libros.length === 1 && this.paginaActual > 0;
        this.cancelarEliminar();
        this.cargarPagina(esUltimoDePagina ? this.paginaActual - 1 : this.paginaActual);
      },
      error: () => {
        this.error = 'No se pudo eliminar el libro.';
        this.eliminando = false;
      }
    });
  }

  private resolverPortada(portada: unknown): string {
    return this.librosService.resolverPortada(portada, this.portadaDefault);
  }

}
