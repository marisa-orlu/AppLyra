import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  colapsado = false;

  private readonly menuItemsBase = [
    { label: 'Home', route: '/home', iconClass: 'bi bi-house', disabled: false },
    { label: 'Libros', route: '/libros', iconClass: 'bi bi-book', disabled: false },
    { label: 'Usuarios', route: '/usuarios', iconClass: 'bi bi-people', disabled: false, adminOnly: true },
    { label: 'Explorar', route: '/explorar', iconClass: 'bi bi-search', disabled: false },
    { label: 'Amigos', route: '/amigos', iconClass: 'bi bi-chat-dots-fill', disabled: false },
    { label: 'Préstamos', route: '/prestamos', iconClass: 'bi bi-journal-arrow-down', disabled: false },
    { label: 'Mi biblioteca', route: '/mi-biblioteca', iconClass: 'bi bi-bookmarks-fill', disabled: false },
    { label: 'Cuenta', route: '/cuenta', iconClass: 'bi bi-person-circle', disabled: false }
    

  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get menuItems() {
    const esAdmin = this.authService.isAdmin();
    return this.menuItemsBase.filter(item => !item.adminOnly || esAdmin);
  }

  toggleSidebar(): void {
    this.colapsado = !this.colapsado;
  }

  cerrarSesion(): void {
    this.authService.logout();
    localStorage.removeItem('rol');

    this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center'
    });

    this.router.navigate(['/login']);
  }
}