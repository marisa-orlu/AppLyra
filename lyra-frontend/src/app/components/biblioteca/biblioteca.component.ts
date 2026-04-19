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
  tituloPanel = 'Te damos la bienvenida a Lyra';

  accesos: AccesoMenu[] = [
    { titulo: 'Libros', ruta: '/libros' },
    { titulo: 'Usuarios', ruta: '/usuarios' },
    { titulo: 'Explorar', ruta: '/explorar' },
    { titulo: 'Amigos', ruta: '/amigos' },
    { titulo: 'Mi biblioteca', ruta: '/mi-biblioteca' },
    { titulo: 'Cuenta', ruta: '/cuenta' }
  ];
}
