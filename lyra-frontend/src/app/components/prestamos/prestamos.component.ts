import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService } from '../../services/prestamos.service';
import { AuthService } from '../../services/auth.service';
import { PrestamoUsuarioLibro } from '../../interfaces/Model/prestamoUsuarioLibro';
import { LibrosService } from '../../services/libros.service';
import { FormsModule } from '@angular/forms';

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
  vista: 'presto' | 'solicito' | 'aceptados' = 'presto';
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  private objectUrls: string[] = [];

  constructor(
    private prestamosService: PrestamosService,
    private authService: AuthService
    , private librosService: LibrosService
  ) {}

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => this.librosService.liberarObjectUrl(url, this.portadaDefault));
    this.objectUrls.length = 0;
  }

  ngOnInit(): void {
    this.cargarPrestamos();
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
        this.enriquecerPrestamosConLibro(this.prestamosComoSolicitante);
      },
      error: () => {
        // silencio parcial: mostrar sección vacía
      }
    });
  }

  private enriquecerPrestamosConLibro(lista: PrestamoUsuarioLibro[] | undefined): void {
    if (!lista || lista.length === 0) return;

    for (const p of lista) {
      try {
        const libroCampo: any = p.libro;
        let idLibro: number | null = null;

        if (!libroCampo) {
          // buscar campos alternativos
          idLibro = Number((p as any).id_libro || (p as any).idLibro || null) || null;
        } else if (typeof libroCampo === 'number') {
          idLibro = Number(libroCampo);
        } else if (typeof libroCampo === 'object') {
          idLibro = Number(libroCampo.id_libro || libroCampo.id || libroCampo.idLibro || null) || null;
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

  get prestamosComoDuenioPendientes(): PrestamoUsuarioLibro[] {
    return this.prestamosComoDuenio.filter(p => (p.estado || '').toUpperCase() === 'PENDIENTE');
  }

  get prestamosComoDuenioAceptados(): PrestamoUsuarioLibro[] {
    return this.prestamosComoDuenio.filter(p => (p.estado || '').toUpperCase() === 'ACEPTADO');
  }

  get prestamosComoSolicitanteAceptados(): PrestamoUsuarioLibro[] {
    return this.prestamosComoSolicitante.filter(p => (p.estado || '').toUpperCase() === 'ACEPTADO');
  }

  confirmarRecepcion(itemOrId: any): void {
    const id = this.extractId(itemOrId);
    if (!id) {
      console.warn('[PrestamosComponent] id inválido al confirmar recepción:', itemOrId);
      this.error = 'ID de préstamo inválido.';
      return;
    }

    // Usamos el valor 4 que en el backend corresponde a DEVUELTO
    this.prestamosService.cambiarEstado(id, 4).subscribe({
      next: () => this.cargarPrestamos(),
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
      next: () => this.cargarPrestamos(),
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
      next: () => this.cargarPrestamos(),
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

    this.prestamosService.devolverPrestamo(id).subscribe({
      next: () => this.cargarPrestamos(),
      error: () => { this.error = 'No se pudo marcar como devuelto.'; }
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
