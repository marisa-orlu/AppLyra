import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  colapsado = false;

  menuItems = [
    { label: 'Home', route: '/home', iconClass: 'bi bi-house', disabled: false },
    { label: 'Libros', route: '/libros', iconClass: 'bi bi-book', disabled: false },
    { label: 'Usuarios', route: '/usuarios', iconClass: 'bi bi-people', disabled: false },
    { label: 'Explorar', route: '/explorar', iconClass: 'bi bi-search', disabled: false },
    { label: 'Amigos', route: '/amigos', iconClass: 'bi bi-chat-dots-fill', disabled: false },
    { label: 'Mi biblioteca', route: '/mi-biblioteca', iconClass: 'bi bi-bookmarks-fill', disabled: false },
    { label: 'Cuenta', route: '/cuenta', iconClass: 'bi bi-person-circle', disabled: false }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.colapsado = !this.colapsado;
  }

  cerrarSesion(): void {
    this.authService.logout();
    localStorage.removeItem('rol');
    this.router.navigate(['/login']);
  }
}
