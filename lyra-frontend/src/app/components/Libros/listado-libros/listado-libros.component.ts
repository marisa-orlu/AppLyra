import { Component, OnInit } from '@angular/core';
import { LibrosService } from '../../../services/libros.service';

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
export class ListadoLibrosComponent implements OnInit {
  libros: LibroVista[] = [];
  cargando = false;
  error = '';
  readonly portadaDefault = 'assets/portadas/quijote.jpg';

  constructor(private librosService: LibrosService) {}

  ngOnInit(): void {
    this.listarLibros();
  }

  listarLibros(): void {
    this.cargando = true;
    this.error = '';

    this.librosService.obtenerTodos().subscribe({
      next: (data: unknown) => {
        const respuesta = Array.isArray(data) ? data : [];
        this.libros = respuesta.map((item: any) => ({
          id: item.id ?? item.id_libro ?? 0,
          titulo: item.titulo ?? item.titulo_libro ?? 'Sin titulo',
          autor: item.autor ?? 'Autor desconocido',
          genero: item.genero ?? null,
          portada: this.resolverPortada(item.portada)
        }));
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

  onPortadaError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes(this.portadaDefault)) {
      img.onerror = null;
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      return;
    }

    img.src = this.portadaDefault;
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
