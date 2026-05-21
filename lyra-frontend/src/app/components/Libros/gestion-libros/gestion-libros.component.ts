import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LibroCrear } from '../../../interfaces/libro-crear';
import { LibrosService } from '../../../services/libros.service';

@Component({
  selector: 'app-gestion-libros',
  standalone: false,
  templateUrl: './gestion-libros.component.html',
  styleUrl: './gestion-libros.component.css'
})
export class GestionLibrosComponent implements OnDestroy {
  guardando = false;
  cargando = false;
  exito = '';
  error = '';
  esEdicion = false;
  libroId: number | null = null;
  readonly maxAnioPublicacion = new Date().getFullYear() + 1;
  readonly portadaDefault = 'assets/portadas/quijote.jpg';
  portadaPreview = this.portadaDefault;
  portadaSeleccionada: File | null = null;
  private portadaPreviewUrl: string | null = null;

  nuevoLibro: LibroCrear = {
    titulo: '',
    autor: '',
    genero: '',
    anio_publicacion: new Date().getFullYear(),
    sinopsis: '',
    portada: ''
  };

  constructor(
    private librosService: LibrosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (idParam && Number.isFinite(id) && id > 0) {
      this.esEdicion = true;
      this.libroId = id;
      this.cargarLibro(id);
    }
  }

  crearLibro(): void {
    this.exito = '';
    this.error = '';

    if (!this.formularioValido()) {
      this.error = 'Completa titulo, autor, genero, anio y selecciona una portada.';
      return;
    }

    this.guardando = true;

    const payload: LibroCrear = {
      titulo: this.nuevoLibro.titulo.trim(),
      autor: this.nuevoLibro.autor.trim(),
      genero: this.nuevoLibro.genero.trim(),
      anio_publicacion: Number(this.nuevoLibro.anio_publicacion),
      sinopsis: this.nuevoLibro.sinopsis.trim(),
      portada: this.nuevoLibro.portada.trim()
    };

    if (this.esEdicion && this.libroId) {
      this.librosService.actualizarLibro(this.libroId, payload).subscribe({
        next: () => {
          this.guardando = false;
          this.exito = 'Libro actualizado correctamente.';

          setTimeout(() => {
            this.router.navigate(['/libros']);
          }, 700);
        },
        error: (err: HttpErrorResponse) => {
          this.guardando = false;
          this.error = this.obtenerMensajeError(err) || 'No se pudo actualizar el libro. Revisa los datos e intentalo de nuevo.';
        }
      });
      return;
    }

    this.librosService.crearLibro(payload, this.portadaSeleccionada as File).subscribe({
      next: () => {
        this.guardando = false;
        this.exito = 'Libro anadido correctamente.';

        setTimeout(() => {
          this.router.navigate(['/libros']);
        }, 700);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = this.obtenerMensajeError(err) || 'No se pudo crear el libro. Revisa los datos e intentalo de nuevo.';
      }
    });
  }

  private obtenerMensajeError(err: HttpErrorResponse): string {
    const detalles: Record<string, string> | undefined = err.error?.detalles;
    const primerDetalle = detalles ? Object.values(detalles)[0] : '';
    return (err.error?.mensaje || err.error?.message || err.error?.error || primerDetalle || '').toString();
  }

  private cargarLibro(id: number): void {
    this.cargando = true;
    this.error = '';

    this.librosService.obtenerPorId(id).subscribe({
      next: (item: any) => {
        const portada = item?.portada ?? '';
        const anio = Number(item?.anio_publicacion ?? new Date().getFullYear());

        this.nuevoLibro = {
          titulo: (item?.titulo ?? item?.titulo_libro ?? '').toString(),
          autor: (item?.autor ?? '').toString(),
          genero: (item?.genero ?? '').toString(),
          anio_publicacion: Number.isFinite(anio) ? anio : new Date().getFullYear(),
          sinopsis: (item?.sinopsis ?? '').toString(),
          portada: portada ? portada.toString() : ''
        };

        this.portadaPreview = this.librosService.resolverPortada(portada, this.portadaDefault);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el libro para editar.';
        this.cargando = false;
      }
    });
  }

  volverListado(): void {
    this.router.navigate(['/libros']);
  }

  onPortadaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (this.portadaPreviewUrl) {
      URL.revokeObjectURL(this.portadaPreviewUrl);
      this.portadaPreviewUrl = null;
    }

    this.portadaSeleccionada = file;

    if (!file) {
      this.nuevoLibro.portada = '';
      this.portadaPreview = this.portadaDefault;
      return;
    }

    this.nuevoLibro.portada = file.name;
    this.portadaPreviewUrl = URL.createObjectURL(file);
    this.portadaPreview = this.portadaPreviewUrl;
  }

  ngOnDestroy(): void {
    if (this.portadaPreviewUrl) {
      URL.revokeObjectURL(this.portadaPreviewUrl);
    }
  }

  private formularioValido(): boolean {
    const anio = Number(this.nuevoLibro.anio_publicacion);
    const anioActual = new Date().getFullYear();
    const portadaValida = this.esEdicion
      ? true
      : !!this.portadaSeleccionada;

    return !!(
      this.nuevoLibro.titulo.trim() &&
      this.nuevoLibro.autor.trim() &&
      this.nuevoLibro.genero.trim() &&
      Number.isFinite(anio) &&
      anio >= 1000 &&
      anio <= anioActual + 1 &&
      portadaValida
    );
  }

}
