import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Libro } from '../../../interfaces/libroDTO';
import { LibrosService } from '../../../services/libros.service';

@Component({
  selector: 'app-detalle-libro',
  standalone: false,
  templateUrl: './detalle-libro.component.html',
  styleUrl: './detalle-libro.component.css'
})
export class DetalleLibroComponent implements OnInit {
  readonly portadaDefault = 'assets/portadas/quijote.jpg';

  libro: Libro | null = null;
  cargando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private librosService: LibrosService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id) || id <= 0) {
      this.error = 'Identificador de libro no valido.';
      return;
    }

    this.cargando = true;
    this.librosService.obtenerPorId(id).subscribe({
      next: (data: unknown) => {
        this.libro = this.mapearLibro(data);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del libro.';
        this.cargando = false;
      }
    });
  }

  volverListado(): void {
    this.router.navigate(['/libros']);
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

  private mapearLibro(data: unknown): Libro {
    const item = (data ?? {}) as any;

    return {
      id: item.id ?? item.id_libro ?? 0,
      titulo: item.titulo ?? item.titulo_libro ?? 'Sin titulo',
      autor: item.autor ?? 'Autor desconocido',
      genero: item.genero ?? null,
      anio_publicacion: item.anio_publicacion ?? item.anioPublicacion ?? null,
      sinopsis: item.sinopsis ?? null,
      portada: this.resolverPortada(item.portada)
    };
  }

  private resolverPortada(portada: unknown): string {
    if (typeof portada !== 'string' || !portada.trim()) {
      return this.portadaDefault;
    }

    const valor = portada.trim();

    if (valor.startsWith('http://') || valor.startsWith('https://') || valor.startsWith('assets/')) {
      return valor;
    }

    const nombreArchivo = valor.split('/').pop()?.split('\\').pop() ?? valor;
    return `assets/portadas/${nombreArchivo}`;
  }
}
