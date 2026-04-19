import { Component } from '@angular/core';

interface AccesoMenu {
  titulo: string;
  ruta?: string;
}

@Component({
  selector: 'app-biblioteca',
  standalone: false,
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css'
})
export class BibliotecaComponent {
  tituloPanel = 'Administrador';

  accesos: AccesoMenu[] = [
    { titulo: 'Libros', ruta: '/libros' },
    { titulo: 'Usuarios' },
    { titulo: 'Explorar' },
    { titulo: 'Amigos' },
    { titulo: 'Mi biblioteca', ruta: '/biblioteca' },
    { titulo: 'Cuenta' }
  ];

  constructor() {
    const rol = localStorage.getItem('rol');
    if (rol === 'USER' || rol === 'ROLE_USER') {
      this.tituloPanel = 'Usuario';
    }
  }

}
