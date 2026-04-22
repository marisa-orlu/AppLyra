import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface AccesoMenu {
  titulo: string;
  ruta?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-biblioteca',
  standalone: false,
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css'
})
export class BibliotecaComponent {
  tituloPanel = 'Te damos la bienvenida a Lyra';

  private readonly accesosBase: AccesoMenu[] = [
    { titulo: 'Libros', ruta: '/libros' },
    { titulo: 'Usuarios', ruta: '/usuarios', adminOnly: true },
    { titulo: 'Explorar', ruta: '/explorar' },
    { titulo: 'Amigos', ruta: '/amigos' },
    { titulo: 'Mi biblioteca', ruta: '/mi-biblioteca' },
    { titulo: 'Cuenta', ruta: '/cuenta' }
  ];

  constructor(private authService: AuthService) {}

  get accesos(): AccesoMenu[] {
    const esAdmin = this.authService.isAdmin();
    return this.accesosBase.filter(acceso => !acceso.adminOnly || esAdmin);
  }
}
