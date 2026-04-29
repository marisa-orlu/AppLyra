import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService } from '../../services/prestamos.service';
import { AuthService } from '../../services/auth.service';
import { PrestamoUsuarioLibro } from '../../interfaces/Model/prestamoUsuarioLibro';
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
  vista: 'presto' | 'solicito' = 'presto';

  constructor(
    private prestamosService: PrestamosService,
    private authService: AuthService
  ) {}

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
      },
      error: () => {
        // silencio parcial: mostrar sección vacía
      }
    });
  }

  formatearFecha(valor: string | null): string {
    if (!valor) return '—';
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return new Intl.DateTimeFormat('es-ES').format(d);
  }
}
