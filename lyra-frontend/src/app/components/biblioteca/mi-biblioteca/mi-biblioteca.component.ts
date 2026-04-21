import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BibliotecaService, LibroUsuarioDto } from '../../../services/biblioteca.service';
import { LibrosService, PageResponse } from '../../../services/libros.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Libro } from '../../../interfaces/libroDTO';

interface LibroUsuarioVista {
  idLibroUsuario: number;
  idUsuario: number;
  idLibro: number;
  estado: string;
  fechaAgregacion: string;
  isPrestamo: boolean;
  puntuacion: number | null;
  titulo: string;
  autor: string;
  genero: string;
  portada: string;
}

interface LibroCatalogoVista {
  idLibro: number;
  titulo: string;
  autor: string;
  genero: string;
}

@Component({
  selector: 'app-mi-biblioteca',
  standalone: false,
  templateUrl: './mi-biblioteca.component.html',
  styleUrl: './mi-biblioteca.component.css'
})
export class MiBibliotecaComponent implements OnInit {
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  readonly estrellasDisponibles = [1, 2, 3, 4, 5];
  readonly estadosDisponibles = [
    { valor: 0, etiqueta: 'Pendiente' },
    { valor: 1, etiqueta: 'Leyendo' },
    { valor: 2, etiqueta: 'Leido' }
  ];

  idUsuario: number | null = null;
  cargando = false;
  eliminandoId: number | null = null;
  mensajeInfo = '';
  error = '';
  librosUsuario: LibroUsuarioVista[] = [];
  mostrarPopupAnadir = false;
  mostrarPopupEditar = false;
  cargandoCatalogo = false;
  guardandoEdicion = false;
  anadiendoLibroId: number | null = null;
  filtroTitulo = '';
  filtroAutor = '';
  librosCatalogo: LibroCatalogoVista[] = [];
  libroEditando: LibroUsuarioVista | null = null;
  estadoEdicion = 0;
  prestamoEdicion = false;
  puntuacionEdicionEstrellas = 0;

  constructor(
    private authService: AuthService,
    private bibliotecaService: BibliotecaService,
    private librosService: LibrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idUsuario = this.authService.getUserId();

    if (!this.idUsuario) {
      this.error = 'No se encontro el id del usuario. Inicia sesion de nuevo.';
      return;
    }

    this.cargarBiblioteca(this.idUsuario);
  }

  trackByLibroUsuario(_: number, item: LibroUsuarioVista): number {
    return item.idLibroUsuario;
  }

  irDetalleLibro(item: LibroUsuarioVista): void {
    if (!Number.isFinite(item.idLibro) || item.idLibro <= 0) {
      return;
    }

    this.router.navigate(['/libros', item.idLibro], {
      queryParams: {
        fromBiblioteca: '1',
        estado: item.estado,
        fechaAgregacion: item.fechaAgregacion,
        prestado: item.isPrestamo ? '1' : '0',
        puntuacion: item.puntuacion ?? ''
      }
    });
  }

  eliminarDeBiblioteca(item: LibroUsuarioVista): void {
    if (this.eliminandoId || item.idLibroUsuario <= 0) {
      return;
    }

    this.error = '';
    this.mensajeInfo = '';
    this.eliminandoId = item.idLibroUsuario;

    this.bibliotecaService.eliminarDeBiblioteca(item.idLibroUsuario).subscribe({
      next: () => {
        this.librosUsuario = this.librosUsuario.filter(x => x.idLibroUsuario !== item.idLibroUsuario);
        this.mensajeInfo = 'Libro eliminado de tu biblioteca.';
        this.eliminandoId = null;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.construirMensajeError(err);
        this.eliminandoId = null;
      }
    });
  }

  obtenerEstrellasSeleccionadas(item: LibroUsuarioVista): number {
    const puntuacion = Number(item.puntuacion ?? 0);

    if (!Number.isFinite(puntuacion) || puntuacion <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(5, Math.round(puntuacion)));
  }

  abrirPopupEditar(item: LibroUsuarioVista): void {
    this.error = '';
    this.mensajeInfo = '';
    this.libroEditando = item;
    this.estadoEdicion = this.normalizarEstado(item.estado);
    this.prestamoEdicion = Boolean(item.isPrestamo);
    this.puntuacionEdicionEstrellas = this.obtenerEstrellasSeleccionadas(item);
    this.mostrarPopupEditar = true;
  }

  cerrarPopupEditar(): void {
    if (this.guardandoEdicion) {
      return;
    }

    this.mostrarPopupEditar = false;
    this.libroEditando = null;
  }

  seleccionarEstrellasEdicion(estrellas: number): void {
    this.puntuacionEdicionEstrellas = Math.max(0, Math.min(5, estrellas));
  }

  guardarEdicionLibro(): void {
    const item = this.libroEditando;

    if (!item || this.guardandoEdicion || item.idLibroUsuario <= 0) {
      return;
    }

    const puntuacionNuevaEscalaCinco = this.puntuacionEdicionEstrellas > 0 ? this.puntuacionEdicionEstrellas : null;
    const puntuacionAnterior = item.puntuacion ?? null;
    const estadoAnterior = this.normalizarEstado(item.estado);
    const prestamoAnterior = Boolean(item.isPrestamo);

    const hayCambioEstado = estadoAnterior !== this.estadoEdicion;
    const hayCambioPrestamo = prestamoAnterior !== this.prestamoEdicion;
    const hayCambioPuntuacion = (puntuacionAnterior ?? null) !== puntuacionNuevaEscalaCinco;

    if (!hayCambioEstado && !hayCambioPrestamo && !hayCambioPuntuacion) {
      this.mensajeInfo = 'No hay cambios para guardar.';
      this.cerrarPopupEditar();
      return;
    }

    this.error = '';
    this.guardandoEdicion = true;

    this.bibliotecaService.editarLibroUsuario(item.idLibroUsuario, {
      estado: this.estadoEdicion,
      isPrestamo: this.prestamoEdicion,
      puntuacion: puntuacionNuevaEscalaCinco
    }).subscribe({
      next: () => {
        item.estado = this.etiquetaEstadoDesdeValor(this.estadoEdicion);
        item.isPrestamo = this.prestamoEdicion;
        item.puntuacion = puntuacionNuevaEscalaCinco;
        this.mensajeInfo = `Cambios guardados en "${item.titulo}".`;
        this.guardandoEdicion = false;
        this.cerrarPopupEditar();
      },
      error: (err: HttpErrorResponse) => {
        const detalle = this.extraerDetalleError(err.error);
        this.error = detalle
          ? `No se pudieron guardar los cambios: ${detalle}`
          : 'No se pudieron guardar los cambios del libro.';
        this.guardandoEdicion = false;
      }
    });
  }

  irAnadirLibro(): void {
    this.abrirPopupAnadirLibro();
  }

  crearCarpeta(): void {
    this.mensajeInfo = 'La funcionalidad de carpetas estara disponible pronto.';
  }

  private cargarBiblioteca(idUsuario: number): void {
    this.cargando = true;
    this.error = '';

    this.bibliotecaService.obtenerBiblioteca(idUsuario).subscribe({
      next: (data: LibroUsuarioDto[]) => {
        const respuesta = Array.isArray(data) ? data : [];
        this.librosUsuario = respuesta.map(item => this.mapearLibroUsuario(item));
        this.completarDatosLibrosFaltantes();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.construirMensajeError(err);
        this.cargando = false;
      }
    });
  }

  abrirPopupAnadirLibro(): void {
    this.mostrarPopupAnadir = true;
    this.filtroTitulo = '';
    this.filtroAutor = '';
    this.error = '';
    this.mensajeInfo = '';

    if (this.librosCatalogo.length === 0) {
      this.cargarCatalogoCompleto();
    }
  }

  cerrarPopupAnadirLibro(): void {
    this.mostrarPopupAnadir = false;
    this.anadiendoLibroId = null;
  }

  get librosCatalogoFiltrados(): LibroCatalogoVista[] {
    const titulo = this.filtroTitulo.trim().toLowerCase();
    const autor = this.filtroAutor.trim().toLowerCase();

    return this.librosCatalogo.filter(item => {
      const cumpleTitulo = !titulo || item.titulo.toLowerCase().includes(titulo);
      const cumpleAutor = !autor || item.autor.toLowerCase().includes(autor);
      return cumpleTitulo && cumpleAutor;
    });
  }

  yaEnBiblioteca(idLibro: number): boolean {
    return this.librosUsuario.some(item => item.idLibro === idLibro);
  }

  anadirLibroABiblioteca(item: LibroCatalogoVista): void {
    if (!this.idUsuario || this.anadiendoLibroId) {
      return;
    }

    if (this.yaEnBiblioteca(item.idLibro)) {
      this.mensajeInfo = 'Ese libro ya esta en tu biblioteca.';
      return;
    }

    this.error = '';
    this.mensajeInfo = '';
    this.anadiendoLibroId = item.idLibro;

    this.bibliotecaService.anadirABiblioteca(this.idUsuario, item.idLibro).subscribe({
      next: (nuevo: LibroUsuarioDto) => {
        const mapeado = this.mapearLibroUsuario(nuevo);
        this.librosUsuario = [mapeado, ...this.librosUsuario];
        this.mensajeInfo = `Libro "${item.titulo}" anadido a tu biblioteca.`;
        this.anadiendoLibroId = null;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.construirMensajeError(err);
        this.anadiendoLibroId = null;
      }
    });
  }

  private construirMensajeError(err: HttpErrorResponse): string {
    const detalle = this.extraerDetalleError(err.error);

    if (err.status === 403) {
      return detalle
        ? `No tienes permisos para cargar tu biblioteca: ${detalle}`
        : 'No tienes permisos para cargar tu biblioteca (403).';
    }

    if (err.status === 404) {
      return detalle
        ? `No se encontro el endpoint de biblioteca: ${detalle}`
        : 'No se encontro el endpoint de biblioteca (404).';
    }

    if (err.status >= 500) {
      return detalle
        ? `Error interno del servidor al cargar la biblioteca: ${detalle}`
        : 'Error interno del servidor al cargar la biblioteca (500).';
    }

    return detalle
      ? `No se pudo cargar tu biblioteca (${err.status || 'sin codigo'}): ${detalle}`
      : `No se pudo cargar tu biblioteca (${err.status || 'sin codigo'}).`;
  }

  private extraerDetalleError(payload: unknown): string {
    if (!payload) {
      return '';
    }

    if (typeof payload === 'string') {
      return payload.trim();
    }

    if (typeof payload === 'object') {
      const data = payload as Record<string, unknown>;
      const candidatos = [data['message'], data['error'], data['details']];

      for (const candidato of candidatos) {
        if (typeof candidato === 'string' && candidato.trim()) {
          return candidato.trim();
        }
      }
    }

    return '';
  }

  private mapearLibroUsuario(item: LibroUsuarioDto): LibroUsuarioVista {
    const idLibroUsuario =
      item.id_libro_usuario ??
      item.idLibroUsuario ??
      0;

    const idUsuario =
      item.id_usuario ??
      item.idUsuario ??
      item.usuario?.id_usuario ??
      item.usuario?.id ??
      0;

    const idLibro =
      item.id_libro ??
      item.idLibro ??
      item.libro?.id_libro ??
      item.libro?.id ??
      0;

    const estado = (item.estado ?? 'PENDIENTE').toString().toUpperCase();
    const fechaBruta = item.fecha_agregacion ?? item.fechaAgregacion ?? null;
    const fechaAgregacion = this.formatearFecha(fechaBruta);

    const isPrestamo = Boolean(item.is_prestamo ?? item.isPrestamo ?? false);
    const puntuacion = this.normalizarPuntuacion(item.puntuacion ?? null);

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
      idLibroUsuario,
      idUsuario,
      idLibro,
      estado,
      fechaAgregacion,
      isPrestamo,
      puntuacion,
      titulo,
      autor,
      genero,
      portada
    };
  }

  private formatearFecha(fecha: string | null): string {
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

  private normalizarEstado(estado: string): number {
    const normalizado = (estado || '').toUpperCase();

    switch (normalizado) {
      case 'LEYENDO':
        return 1;
      case 'LEIDO':
        return 2;
      case 'PENDIENTE':
      default:
        return 0;
    }
  }

  private etiquetaEstadoDesdeValor(valor: number): string {
    switch (valor) {
      case 1:
        return 'LEYENDO';
      case 2:
        return 'LEIDO';
      case 0:
      default:
        return 'PENDIENTE';
    }
  }

  private normalizarPuntuacion(puntuacion: number | null): number | null {
    if (puntuacion === null || puntuacion === undefined) {
      return null;
    }

    const valor = Number(puntuacion);

    if (!Number.isFinite(valor)) {
      return null;
    }

    return Math.max(0, Math.min(5, Math.round(valor)));
  }

  private completarDatosLibrosFaltantes(): void {
    const faltantes = this.librosUsuario.filter(item =>
      item.idLibro > 0 &&
      (
        item.titulo === 'Sin titulo' ||
        item.autor === 'Autor desconocido' ||
        item.portada === this.portadaDefault
      )
    );

    if (faltantes.length === 0) {
      return;
    }

    const solicitudes = faltantes.map(item =>
      this.librosService.obtenerPorId(item.idLibro).pipe(
        map(libro => ({ item, libro })),
        catchError(() => of({ item, libro: null }))
      )
    );

    forkJoin(solicitudes).subscribe(resultados => {
      resultados.forEach(resultado => {
        if (!resultado.libro) {
          return;
        }

        const libro: any = resultado.libro;
        resultado.item.titulo = (libro.titulo ?? libro.titulo_libro ?? resultado.item.titulo).toString();
        resultado.item.autor = (libro.autor ?? resultado.item.autor).toString();
        resultado.item.genero = (libro.genero ?? resultado.item.genero).toString();
        resultado.item.portada = this.librosService.resolverPortada(libro.portada, this.portadaDefault);
      });
    });
  }

  private cargarCatalogoCompleto(): void {
    this.cargandoCatalogo = true;
    this.librosCatalogo = [];

    this.cargarPaginaCatalogo(0, []);
  }

  private cargarPaginaCatalogo(page: number, acumulado: LibroCatalogoVista[]): void {
    this.librosService.obtenerTodos(page, 30).subscribe({
      next: (data: PageResponse<Libro>) => {
        const respuesta = Array.isArray(data?.content) ? data.content : [];
        const nuevos = respuesta.map((item: any) => this.mapearCatalogo(item));
        const combinado = [...acumulado, ...nuevos];

        if (data?.last || respuesta.length === 0) {
          const unicos = new Map<number, LibroCatalogoVista>();
          combinado.forEach(libro => {
            if (libro.idLibro > 0) {
              unicos.set(libro.idLibro, libro);
            }
          });
          this.librosCatalogo = Array.from(unicos.values());
          this.cargandoCatalogo = false;
          return;
        }

        this.cargarPaginaCatalogo(page + 1, combinado);
      },
      error: () => {
        this.error = 'No se pudo cargar el catalogo de libros para anadir.';
        this.cargandoCatalogo = false;
      }
    });
  }

  private mapearCatalogo(item: any): LibroCatalogoVista {
    return {
      idLibro: Number(item?.id ?? item?.id_libro ?? 0),
      titulo: (item?.titulo ?? item?.titulo_libro ?? 'Sin titulo').toString(),
      autor: (item?.autor ?? 'Autor desconocido').toString(),
      genero: (item?.genero ?? 'Sin genero').toString()
    };
  }
}
