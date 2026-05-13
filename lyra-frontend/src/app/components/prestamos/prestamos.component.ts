import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService } from '../../services/prestamos.service';
import { AuthService } from '../../services/auth.service';
import { PrestamoUsuarioLibro } from '../../interfaces/Model/prestamoUsuarioLibro';
import { LibrosService } from '../../services/libros.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../interfaces/Model/usuario';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css']
})
export class PrestamosComponent implements OnInit {
  cargando = true;
  error = '';

  prestamosComoDuenio: PrestamoUsuarioLibro[] = [];
  prestamosComoSolicitante: PrestamoUsuarioLibro[] = [];
  vista: 'presto' | 'solicito' | 'aceptados' | 'devueltos' = 'presto';
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  private objectUrls: string[] = [];
  private routeSub?: Subscription;
  private readonly usuariosCache = new Map<number, Usuario>();

  constructor(
    private prestamosService: PrestamosService,
    private authService: AuthService
    , private librosService: LibrosService
    , private snackBar: MatSnackBar
    , private route: ActivatedRoute
    , private router: Router
    , private usuarioService: UsuarioService
  ) {}

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
    this.objectUrls.length = 0;
  }

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(data => {
      const vista = data?.['vista'] as any;
      if (vista === 'presto' || vista === 'solicito' || vista === 'aceptados' || vista === 'devueltos') {
        this.vista = vista;
      }
    });

    this.cargarPrestamos();
  }

  onVistaChange(nuevaVista: 'presto' | 'solicito' | 'aceptados' | 'devueltos'): void {
    const segmento = this.segmentoParaVista(nuevaVista);
    if (!segmento) return;
    if (this.router.url.endsWith('/' + segmento)) return;
    this.router.navigate(['/prestamos', segmento]);
  }

  private segmentoParaVista(vista: 'presto' | 'solicito' | 'aceptados' | 'devueltos'): string {
    switch (vista) {
      case 'presto':
        return 'prestados';
      case 'solicito':
        return 'solicitados';
      case 'aceptados':
        return 'aceptados';
      case 'devueltos':
        return 'devueltos';
      default:
        return 'prestados';
    }
  }

  private cargarPrestamos(): void {
    const id = this.authService.getUserId();

    if (!id) {
      this.error = 'No se ha encontrado el usuario autenticado.';
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.error = '';

    this.prestamosService.obtenerPorDuenio(id).subscribe({
      next: (lista) => {
        this.prestamosComoDuenio = lista || [];
        this.prestamosComoDuenio.forEach(p => this.normalizarPrestamo(p));
        this.enriquecerPrestamosConUsuarios(this.prestamosComoDuenio);
        this.enriquecerPrestamosConLibro(this.prestamosComoDuenio);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los préstamos donde eres dueño.';
        this.cargando = false;
      }
    });

    this.prestamosService.obtenerPorSolicitante(id).subscribe({
      next: (lista) => {
        this.prestamosComoSolicitante = lista || [];
        this.prestamosComoSolicitante.forEach(p => this.normalizarPrestamo(p));
        this.enriquecerPrestamosConUsuarios(this.prestamosComoSolicitante);
        this.enriquecerPrestamosConLibro(this.prestamosComoSolicitante);
      },
      error: () => {
        // silencio parcial: mostrar sección vacía
      }
    });
  }

  private normalizarPrestamo(p: PrestamoUsuarioLibro): void {
    // Normalizamos para que el template no reviente aunque el DTO venga parcial.
    // Ojo: si existen `duenio/solicitante` los respetamos.
    const tieneRoles = !!((p as any).duenio || (p as any).solicitante);
    const usuarioCampo: any = (p as any).usuario;
    if (!tieneRoles && (!usuarioCampo || typeof usuarioCampo !== 'object')) {
      (p as any).usuario = this.crearUsuarioBasico(0, '—');
    }

    const libroCampo: any = (p as any).libro;
    if (typeof libroCampo === 'number' && Number.isFinite(libroCampo) && libroCampo > 0) {
      (p as any).libro = {
        id_libro: libroCampo,
        titulo_libro: '',
        autor: '',
        genero: null,
        anio_publicacion: null,
        sinopsis: null,
        portada: null,
        resenas: [],
        frases: [],
        usuarios_libro: [],
        prestamos: []
      };
    } else if (!libroCampo || typeof libroCampo !== 'object') {
      (p as any).libro = {
        id_libro: 0,
        titulo_libro: '',
        autor: '',
        genero: null,
        anio_publicacion: null,
        sinopsis: null,
        portada: null,
        resenas: [],
        frases: [],
        usuarios_libro: [],
        prestamos: []
      };
    }

    // Fechas: permitir camelCase si llega del DTO
    if ((p as any).fechaInicio != null && (p as any).fecha_inicio == null) {
      (p as any).fecha_inicio = (p as any).fechaInicio;
    }
    if ((p as any).fechaFin != null && (p as any).fecha_fin == null) {
      (p as any).fecha_fin = (p as any).fechaFin;
    }
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

  private crearUsuarioBasico(id: number, nombre: string, email = ''): Usuario {
    return {
      id,
      nombre,
      email,
      contrasena: '',
      fechaRegistro: '',
      fotoPerfil: null,
      biografia: null,
      rol: 'USER',
      resenas: [],
      frases: [],
      librosUsuario: [],
      prestamos: []
    };
  }

  private extraerUsuarioDesdePrestamo(p: any, tipo: 'duenio' | 'solicitante'): Usuario | null {
    const direct = p?.[tipo];
    if (direct && typeof direct === 'object') return direct as Usuario;

    const alt1 = p?.[`usuario${tipo === 'duenio' ? 'Duenio' : 'Solicitante'}`];
    if (alt1 && typeof alt1 === 'object') return alt1 as Usuario;

    const alt2 = p?.[`usuario_${tipo}`];
    if (alt2 && typeof alt2 === 'object') return alt2 as Usuario;

    return null;
  }

  private extraerIdUsuario(p: any, tipo: 'duenio' | 'solicitante'): number | null {
    const nested = this.extraerUsuarioDesdePrestamo(p, tipo);
    const nestedId = Number((nested as any)?.id ?? 0);
    if (Number.isFinite(nestedId) && nestedId > 0) return nestedId;

    const candidates = tipo === 'duenio'
      ? [p?.idDuenio, p?.id_duenio, p?.duenioId, p?.id_dueno, p?.id_dueño]
      : [p?.idSolicitante, p?.id_solicitante, p?.solicitanteId];

    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0) return n;
    }

    return null;
  }

  private nombreDeUsuario(u: any): string {
    const nombre = (u?.nombre ?? u?.username ?? u?.nick ?? u?.nombreUsuario ?? '').toString().trim();
    if (nombre) return nombre;
    const email = (u?.email ?? u?.correo ?? '').toString().trim();
    return email || '—';
  }

  nombreDuenio(p: PrestamoUsuarioLibro): string {
    const anyP: any = p as any;
    const duenio = this.extraerUsuarioDesdePrestamo(anyP, 'duenio');
    if (duenio) return this.nombreDeUsuario(duenio);
    if (anyP.usuario && typeof anyP.usuario === 'object') {
      // En listas del endpoint /solicitante/{id}, muchas veces `usuario` es el dueño.
      return this.nombreDeUsuario(anyP.usuario);
    }
    const id = this.extraerIdUsuario(anyP, 'duenio');
    if (id && this.usuariosCache.has(id)) return this.nombreDeUsuario(this.usuariosCache.get(id));
    return '—';
  }

  nombreSolicitante(p: PrestamoUsuarioLibro): string {
    const anyP: any = p as any;
    const sol = this.extraerUsuarioDesdePrestamo(anyP, 'solicitante');
    if (sol) return this.nombreDeUsuario(sol);
    if (anyP.usuario && typeof anyP.usuario === 'object') {
      // En listas del endpoint /duenio/{id}, muchas veces `usuario` es el solicitante.
      return this.nombreDeUsuario(anyP.usuario);
    }
    const id = this.extraerIdUsuario(anyP, 'solicitante');
    if (id && this.usuariosCache.has(id)) return this.nombreDeUsuario(this.usuariosCache.get(id));
    return '—';
  }

  obtenerFechaFin(p: PrestamoUsuarioLibro): string | null {
    const anyP: any = p as any;
    return (anyP.fecha_fin ?? anyP.fechaFin ?? anyP.fechaFinal ?? anyP.fecha_final ?? null) as string | null;
  }

  private enriquecerPrestamosConUsuarios(lista: PrestamoUsuarioLibro[] | undefined): void {
    if (!lista || lista.length === 0) return;

    for (const p of lista) {
      const anyP: any = p as any;

      const idDuenio = this.extraerIdUsuario(anyP, 'duenio');
      const idSolicitante = this.extraerIdUsuario(anyP, 'solicitante');

      if (idDuenio && !this.usuariosCache.has(idDuenio)) {
        this.usuarioService.obtenerPorId(idDuenio).subscribe({
          next: (u) => {
            const usuario = this.crearUsuarioBasico(u.id, u.nombre || '—', u.email || '');
            this.usuariosCache.set(u.id, usuario);
            if (!anyP.duenio) anyP.duenio = usuario;
          },
          error: () => {
            // ignorar
          }
        });
      } else if (idDuenio && this.usuariosCache.has(idDuenio) && !anyP.duenio) {
        anyP.duenio = this.usuariosCache.get(idDuenio);
      }

      if (idSolicitante && !this.usuariosCache.has(idSolicitante)) {
        this.usuarioService.obtenerPorId(idSolicitante).subscribe({
          next: (u) => {
            const usuario = this.crearUsuarioBasico(u.id, u.nombre || '—', u.email || '');
            this.usuariosCache.set(u.id, usuario);
            if (!anyP.solicitante) anyP.solicitante = usuario;
          },
          error: () => {
            // ignorar
          }
        });
      } else if (idSolicitante && this.usuariosCache.has(idSolicitante) && !anyP.solicitante) {
        anyP.solicitante = this.usuariosCache.get(idSolicitante);
      }
    }
  }

  private enriquecerPrestamosConLibro(lista: PrestamoUsuarioLibro[] | undefined): void {
    if (!lista || lista.length === 0) return;

    for (const p of lista) {
      try {
        const libroCampo: any = p.libro;
        let idLibro: number | null = null;

        if (!libroCampo) {
          // buscar campos alternativos
          idLibro = Number((p as any).id_libro || (p as any).idLibro || (p as any).idLibro || (p as any).id_libro || null) || null;
        } else if (typeof libroCampo === 'number') {
          idLibro = Number(libroCampo);
        } else if (typeof libroCampo === 'object') {
          idLibro = Number(
            libroCampo.id_libro ||
            libroCampo.idLibro ||
            libroCampo.id ||
            (p as any).idLibro ||
            (p as any).id_libro ||
            null
          ) || null;
        }

        if (!idLibro || Number.isNaN(idLibro)) continue;

        this.librosService.obtenerPorId(idLibro).subscribe({
          next: (lib) => {
            const mapa = {
              id_libro: (lib as any).id_libro ?? (lib as any).id ?? idLibro,
              titulo_libro: (lib as any).titulo_libro ?? (lib as any).titulo ?? (lib as any).tituloLibro ?? '',
              autor: (lib as any).autor ?? '',
              genero: (lib as any).genero ?? null,
              anio_publicacion: (lib as any).anio_publicacion ?? (lib as any).anioPublicacion ?? null,
              sinopsis: (lib as any).sinopsis ?? null,
              portada: (lib as any).portada ?? null,
              resenas: [],
              frases: [],
              usuarios_libro: [],
              prestamos: []
            } as any;

            p.libro = mapa;

            // Resolver la portada para que el componente pueda mostrarla correctamente
            const portadaInicial = mapa.portada;
            const portadaResuelta = this.librosService.resolverPortada(portadaInicial, this.portadaDefault);

            this.librosService.obtenerPortadaSegura(portadaResuelta, this.portadaDefault).subscribe(url => {
              if (url.startsWith('blob:')) {
                this.objectUrls.push(url);
              }
              p.libro.portada = url;
            });
          },
          error: () => {
            // no hacemos nada si falla la obtención del libro
          }
        });
      } catch (e) {
        // ignorar errores individuales
        console.warn('[PrestamosComponent] enriquecerPrestamosConLibro error', e);
      }
    }
  }

  resolverPortada(portada: unknown): string {
    return this.librosService.resolverPortada(portada, this.portadaDefault);
  }

  tituloLibro(p: PrestamoUsuarioLibro): string {
    const anyLibro: any = (p as any)?.libro;
    const titulo = (anyLibro?.titulo_libro ?? anyLibro?.titulo ?? anyLibro?.tituloLibro ?? '').toString().trim();
    if (titulo) return titulo;

    const id = Number(anyLibro?.id_libro ?? anyLibro?.id ?? anyLibro?.idLibro ?? 0);
    return Number.isFinite(id) && id > 0 ? `Libro #${id}` : 'Libro';
  }

  get prestamosComoDuenioPendientes(): PrestamoUsuarioLibro[] {
    return this.prestamosComoDuenio.filter(p => (p.estado || '').toUpperCase() === 'PENDIENTE');
  }

  get prestamosComoDuenioAceptados(): PrestamoUsuarioLibro[] {
    return this.prestamosComoDuenio.filter(p => (p.estado || '').toUpperCase() === 'ACEPTADO');
  }

  get prestamosComoSolicitanteAceptados(): PrestamoUsuarioLibro[] {
    return this.prestamosComoSolicitante.filter(p => (p.estado || '').toUpperCase() === 'ACEPTADO');
  }

  get prestamosComoDuenioDevueltos(): PrestamoUsuarioLibro[] {
    return this.prestamosComoDuenio.filter(p => (p.estado || '').toUpperCase() === 'DEVUELTO');
  }

  get prestamosComoSolicitanteDevueltos(): PrestamoUsuarioLibro[] {
    return this.prestamosComoSolicitante.filter(p => (p.estado || '').toUpperCase() === 'DEVUELTO');
  }

  confirmarRecepcion(itemOrId: any): void {
    const id = this.extractId(itemOrId);
    if (!id) {
      console.warn('[PrestamosComponent] id inválido al confirmar recepción:', itemOrId);
      this.error = 'ID de préstamo inválido.';
      return;
    }

    // Llamamos al endpoint específico para confirmar la devolución
    this.prestamosService.confirmarDevolucion(id).subscribe({
      next: () => {
        this.snackBar.open('Libro marcado como recibido.', 'Cerrar', { duration: 3000 });
        this.cargarPrestamos();
      },
      error: () => { this.error = 'No se pudo confirmar la recepción.'; }
    });
  }

  private extractId(valor: any): number | null {
    if (!valor && valor !== 0) return null;
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const n = Number(valor);
      return Number.isFinite(n) ? n : null;
    }
    const candidates = [valor.id_prestamo, valor.idPrestamo, valor.id, valor.prestamoId, valor.prestamo];
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  aceptarPrestamo(itemOrId: any): void {
    const id = this.extractId(itemOrId);
    if (!id) {
      console.warn('[PrestamosComponent] id inválido al aceptar:', itemOrId);
      this.error = 'ID de préstamo inválido.';
      return;
    }

    this.prestamosService.aceptarPrestamo(id).subscribe({
      next: () => { this.snackBar.open('Préstamo aceptado.', 'Cerrar', { duration: 2500 }); this.cargarPrestamos(); },
      error: () => { this.error = 'No se pudo aceptar el préstamo.'; }
    });
  }

  rechazarPrestamo(itemOrId: any): void {
    const id = this.extractId(itemOrId);
    if (!id) {
      console.warn('[PrestamosComponent] id inválido al rechazar:', itemOrId);
      this.error = 'ID de préstamo inválido.';
      return;
    }

    this.prestamosService.rechazarPrestamo(id).subscribe({
      next: () => { this.snackBar.open('Préstamo rechazado.', 'Cerrar', { duration: 2500 }); this.cargarPrestamos(); },
      error: () => { this.error = 'No se pudo rechazar el préstamo.'; }
    });
  }

  devolverPrestamo(itemOrId: any): void {
    const id = this.extractId(itemOrId);
    if (!id) {
      console.warn('[PrestamosComponent] id inválido al devolver:', itemOrId);
      this.error = 'ID de préstamo inválido.';
      return;
    }

    // El solicitante solicita la devolución (marca como PENDIENTE_DEVOLUCION)
    this.prestamosService.devolverPrestamo(id).subscribe({
      next: () => { this.snackBar.open('Solicitud de devolución enviada.', 'Cerrar', { duration: 3000 }); this.cargarPrestamos(); },
      error: () => { this.error = 'No se pudo solicitar la devolución.'; }
    });
  }

  // Métodos de depuración para inspeccionar el objeto pasado desde la plantilla
  debugAceptar(item: any): void {
    console.log('[PrestamosComponent] debug aceptar item:', item);
    this.aceptarPrestamo(item);
  }

  debugRechazar(item: any): void {
    console.log('[PrestamosComponent] debug rechazar item:', item);
    this.rechazarPrestamo(item);
  }

  debugDevolver(item: any): void {
    console.log('[PrestamosComponent] debug devolver item:', item);
    this.devolverPrestamo(item);
  }

  formatearFecha(valor: string | null): string {
    if (!valor) return '—';
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return new Intl.DateTimeFormat('es-ES').format(d);
  }
}
