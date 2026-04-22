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
  anioPublicacion: number | null;
  portada: string | null;
  creadorId: number | null;
}

@Component({
  selector: 'app-listado-libros',
  standalone: false,
  templateUrl: './listado-libros.component.html',
  styleUrl: './listado-libros.component.css'
})
export class ListadoLibrosComponent implements OnInit, OnDestroy {
  libros: LibroVista[] = [];
  mostrarFiltros = false;
  filtroTitulo = '';
  filtroAutor = '';
  filtroAnio = '';
  filtroCategoria = '';
  cargando = false;
  error = '';
  esAdmin = false;
  usuarioActualId: number | null = null;
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
    this.usuarioActualId = this.authService.getUserId();
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
          anioPublicacion: this.obtenerAnioPublicacion(item),
          portada: this.resolverPortada(item.portada),
          creadorId: this.obtenerCreadorId(item)
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

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  limpiarFiltros(): void {
    this.filtroTitulo = '';
    this.filtroAutor = '';
    this.filtroAnio = '';
    this.filtroCategoria = '';
  }

  get hayFiltrosActivos(): boolean {
    return !!(
      this.filtroTitulo.trim() ||
      this.filtroAutor.trim() ||
      this.filtroAnio.trim() ||
      this.filtroCategoria.trim()
    );
  }

  get categoriasDisponibles(): string[] {
    const unicas = new Set<string>();

    this.libros.forEach(libro => {
      const genero = (libro.genero ?? '').trim();
      if (genero) {
        unicas.add(genero);
      }
    });

    return Array.from(unicas).sort((a, b) => a.localeCompare(b, 'es'));
  }

  get librosFiltrados(): LibroVista[] {
    const titulo = this.filtroTitulo.trim().toLowerCase();
    const autor = this.filtroAutor.trim().toLowerCase();
    const categoria = this.filtroCategoria.trim().toLowerCase();
    const anioFiltro = Number(this.filtroAnio.trim());
    const filtrarPorAnio = this.filtroAnio.trim() !== '' && Number.isFinite(anioFiltro);

    return this.libros.filter(libro => {
      const coincideTitulo = !titulo || libro.titulo.toLowerCase().includes(titulo);
      const coincideAutor = !autor || libro.autor.toLowerCase().includes(autor);
      const coincideCategoria = !categoria || (libro.genero ?? '').toLowerCase() === categoria;
      const coincideAnio = !filtrarPorAnio || libro.anioPublicacion === anioFiltro;

      return coincideTitulo && coincideAutor && coincideCategoria && coincideAnio;
    });
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

  puedeGestionar(libro: LibroVista): boolean {
    if (this.esAdmin) {
      return true;
    }

    if (!this.usuarioActualId) {
      return false;
    }

    return libro.creadorId === this.usuarioActualId;
  }

  private obtenerCreadorId(item: any): number | null {
    const candidatos = [
      item?.id_usuario_creador,
      item?.idUsuarioCreador,
      item?.usuarioCreador?.id,
      item?.usuarioCreador?.id_usuario
    ];

    for (const candidato of candidatos) {
      const id = Number(candidato);
      if (Number.isFinite(id) && id > 0) {
        return id;
      }
    }

    return null;
  }

  private obtenerAnioPublicacion(item: any): number | null {
    const anio = Number(item?.anio_publicacion ?? item?.anioPublicacion ?? null);
    return Number.isFinite(anio) ? anio : null;
  }

  private resolverPortada(portada: unknown): string {
    return this.librosService.resolverPortada(portada, this.portadaDefault);
  }
}