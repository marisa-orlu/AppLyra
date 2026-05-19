import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LibrosService, PageResponse } from '../../../services/libros.service';
import { AuthService } from '../../../services/auth.service';
import { Libro } from '../../../interfaces/libroDTO';
import { EMPTY, expand, reduce } from 'rxjs';

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
  categoriasGlobales: string[] = [];
  private categoriasGlobalesCargadas = false;
  private cargandoCategoriasGlobales = false;
  cargando = false;
  error = '';
  esAdmin = false;
  usuarioActualId: number | null = null;
  mostrarConfirmacion = false;
  eliminando = false;
  libroAEliminar: LibroVista | null = null;
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  readonly pageSize = 15;
  private readonly pageSizeCargaCompleta = 200;
  paginaActual = 0;
  totalPaginas = 0;
  totalElementos = 0;
  private modoBusquedaTitulo = false;
  private cargandoListadoCompleto = false;
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
    if (this.paginaVista <= 0 || this.cargando) {
      return;
    }

    if (this.modoBusquedaTitulo) {
      this.paginaActual = this.paginaVista - 1;
      return;
    }

    this.cargarPagina(this.paginaActual - 1);
  }

  irPaginaSiguiente(): void {
    if (this.paginaVista >= this.totalPaginasVista - 1 || this.cargando) {
      return;
    }

    if (this.modoBusquedaTitulo) {
      this.paginaActual = this.paginaVista + 1;
      return;
    }

    this.cargarPagina(this.paginaActual + 1);
  }

  onFiltroTituloInput(valor: string): void {
    this.filtroTitulo = valor ?? '';
    this.onCualquierFiltroCambio();
  }

  onFiltroAutorInput(valor: string): void {
    this.filtroAutor = valor ?? '';
    this.onCualquierFiltroCambio();
  }

  onFiltroAnioInput(valor: string): void {
    this.filtroAnio = valor ?? '';
    this.onCualquierFiltroCambio();
  }

  onFiltroCategoriaChange(valor: string): void {
    this.filtroCategoria = valor ?? '';
    this.onCualquierFiltroCambio();
  }

  private onCualquierFiltroCambio(): void {
    const hayFiltros = this.hayFiltrosActivos;

    // Si no hay filtros, volvemos al listado paginado del backend.
    if (!hayFiltros) {
      const estabaEnModoLocal = this.modoBusquedaTitulo;
      this.modoBusquedaTitulo = false;
      this.paginaActual = 0;
      if (estabaEnModoLocal) {
        this.cargarPagina(0);
      }
      return;
    }

    // Con cualquier filtro activo, aplicamos sobre TODO el catálogo paginando localmente.
    const activarModoLocal = !this.modoBusquedaTitulo;
    this.modoBusquedaTitulo = true;
    this.paginaActual = 0;

    if (activarModoLocal) {
      this.cargarListadoCompletoParaFiltrado();
    }
  }

  private cargarListadoCompletoParaFiltrado(): void {
    if (this.cargandoListadoCompleto) {
      return;
    }

    this.cargandoListadoCompleto = true;
    this.cargando = true;
    this.error = '';

    // Liberar blobs previos antes de recargar el listado.
    this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
    this.objectUrls.length = 0;

    const size = this.pageSizeCargaCompleta;

    this.librosService.obtenerTodos(0, size).pipe(
      expand((data: PageResponse<Libro>) => {
        const totalPages = Number.isFinite(data?.totalPages) ? data.totalPages : null;
        const number = Number.isFinite(data?.number) ? data.number : null;

        // Preferimos totalPages/number porque algunos backends no devuelven 'last'.
        if (totalPages !== null && number !== null) {
          if (number >= totalPages - 1) {
            return EMPTY;
          }
          return this.librosService.obtenerTodos(number + 1, size);
        }

        if (data?.last) {
          return EMPTY;
        }
        const siguiente = Number.isFinite(data?.number) ? data.number + 1 : 1;
        return this.librosService.obtenerTodos(siguiente, size);
      }),
      reduce((acumulado: Libro[], data: PageResponse<Libro>) => {
        const contenido = Array.isArray(data?.content) ? data.content : [];
        acumulado.push(...contenido);
        return acumulado;
      }, [] as Libro[])
    ).subscribe({
      next: (todos: Libro[]) => {
        this.libros = todos.map(item => this.mapearLibroVista(item));

        this.libros.forEach(libro => {
          this.librosService.obtenerPortadaSegura(libro.portada, this.portadaDefault).subscribe(url => {
            if (url.startsWith('blob:')) {
              this.objectUrls.push(url);
            }
            libro.portada = url;
          });
        });

        this.cargando = false;
        this.cargandoListadoCompleto = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los libros para aplicar los filtros.';
        this.cargando = false;
        this.cargandoListadoCompleto = false;
        this.modoBusquedaTitulo = false;
      }
    });
  }

  private cargarPagina(page: number): void {
    if (this.modoBusquedaTitulo) {
      // En modo búsqueda por título, la paginación es local.
      this.paginaActual = page;
      return;
    }

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

        this.libros = respuesta.map(item => this.mapearLibroVista(item));

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

  private mapearLibroVista(item: any): LibroVista {
    return {
      id: item?.id ?? item?.id_libro ?? 0,
      titulo: item?.titulo ?? item?.titulo_libro ?? 'Sin titulo',
      autor: item?.autor ?? 'Autor desconocido',
      genero: item?.genero ?? null,
      anioPublicacion: this.obtenerAnioPublicacion(item),
      portada: this.resolverPortada(item?.portada),
      creadorId: this.obtenerCreadorId(item)
    };
  }

  trackByLibro(_: number, libro: LibroVista): number {
    return libro.id;
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;

    // Asegura que el select de categorías muestre todas, no solo las de la página actual.
    if (this.mostrarFiltros) {
      this.cargarCategoriasGlobalesSiHaceFalta();
    }
  }

  limpiarFiltros(): void {
    this.filtroTitulo = '';
    this.filtroAutor = '';
    this.filtroAnio = '';
    this.filtroCategoria = '';

    if (this.modoBusquedaTitulo) {
      this.modoBusquedaTitulo = false;
      this.paginaActual = 0;
      this.cargarPagina(0);
    }
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
    if (this.categoriasGlobalesCargadas && this.categoriasGlobales.length) {
      return this.categoriasGlobales;
    }

    const unicas = new Set<string>();

    this.libros.forEach(libro => {
      const genero = (libro.genero ?? '').trim();
      if (genero) {
        unicas.add(genero);
      }
    });

    return Array.from(unicas).sort((a, b) => a.localeCompare(b, 'es'));
  }

  private cargarCategoriasGlobalesSiHaceFalta(): void {
    if (this.categoriasGlobalesCargadas || this.cargandoCategoriasGlobales) {
      return;
    }

    this.cargandoCategoriasGlobales = true;
    const size = this.pageSizeCargaCompleta;

    this.librosService.obtenerTodos(0, size).pipe(
      expand((data: PageResponse<Libro>) => {
        const totalPages = Number.isFinite(data?.totalPages) ? data.totalPages : null;
        const number = Number.isFinite(data?.number) ? data.number : null;

        if (totalPages !== null && number !== null) {
          if (number >= totalPages - 1) {
            return EMPTY;
          }
          return this.librosService.obtenerTodos(number + 1, size);
        }

        if (data?.last) {
          return EMPTY;
        }

        const siguiente = Number.isFinite(data?.number) ? data.number + 1 : 1;
        return this.librosService.obtenerTodos(siguiente, size);
      }),
      reduce((acumulado: Set<string>, data: PageResponse<Libro>) => {
        const contenido = Array.isArray(data?.content) ? data.content : [];
        for (const item of contenido) {
          const genero = String((item as any)?.genero ?? '').trim();
          if (genero) {
            acumulado.add(genero);
          }
        }
        return acumulado;
      }, new Set<string>())
    ).subscribe({
      next: (setGeneros: Set<string>) => {
        this.categoriasGlobales = Array.from(setGeneros).sort((a, b) => a.localeCompare(b, 'es'));
        this.categoriasGlobalesCargadas = true;
        this.cargandoCategoriasGlobales = false;
      },
      error: () => {
        // Si falla, mantenemos el fallback por página sin romper la UI.
        this.cargandoCategoriasGlobales = false;
      }
    });
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
      const generoNormalizado = (libro.genero ?? '').trim().toLowerCase();
      const coincideCategoria = !categoria || generoNormalizado === categoria;
      const coincideAnio = !filtrarPorAnio || libro.anioPublicacion === anioFiltro;

      return coincideTitulo && coincideAutor && coincideCategoria && coincideAnio;
    });
  }

  get librosMostrados(): LibroVista[] {
    if (!this.modoBusquedaTitulo) {
      return this.librosFiltrados;
    }

    const inicio = this.paginaVista * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.librosFiltrados.slice(inicio, fin);
  }

  get totalPaginasVista(): number {
    if (!this.modoBusquedaTitulo) {
      return this.totalPaginas;
    }

    const total = this.librosFiltrados.length;
    return total > 0 ? Math.ceil(total / this.pageSize) : 0;
  }

  get totalElementosVista(): number {
    if (!this.modoBusquedaTitulo) {
      return this.totalElementos;
    }
    return this.librosFiltrados.length;
  }

  get paginaVista(): number {
    if (!this.modoBusquedaTitulo) {
      return this.paginaActual;
    }

    const total = this.totalPaginasVista;
    if (total <= 0) return 0;
    return Math.min(Math.max(this.paginaActual, 0), total - 1);
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