import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

type MenuChildItem = {
  label: string;
  route: string;
  disabled: boolean;
};

type MenuItem = {
  label: string;
  route: string;
  iconClass?: string;
  disabled: boolean;
  adminOnly?: boolean;
  children?: MenuChildItem[];
};

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  colapsado = false;

  private readonly submenusAbiertos = new Set<string>();

  private readonly menuItemsBase: MenuItem[] = [
    { label: 'Home', route: '/home', iconClass: 'bi bi-house', disabled: false },
    { label: 'Libros', route: '/libros', iconClass: 'bi bi-book', disabled: false },
    { label: 'Usuarios', route: '/usuarios', iconClass: 'bi bi-people', disabled: false, adminOnly: true },
    { label: 'Explorar', route: '/explorar', iconClass: 'bi bi-search', disabled: false },
    { label: 'Amigos', route: '/amigos', iconClass: 'bi bi-chat-dots-fill', disabled: false },
    {
      label: 'Préstamos',
      route: '/prestamos',
      iconClass: 'bi bi-journal-arrow-down',
      disabled: false,
      children: [
        { label: 'Libros prestados', route: '/prestamos/prestados', disabled: false },
        { label: 'Libros solicitados', route: '/prestamos/solicitados', disabled: false },
        { label: 'Libros aceptados', route: '/prestamos/aceptados', disabled: false },
        { label: 'Libros devueltos', route: '/prestamos/devueltos', disabled: false }
      ]
    },
    { label: 'Mi biblioteca', route: '/mi-biblioteca', iconClass: 'bi bi-bookmarks-fill', disabled: false },
    { label: 'Cuenta', route: '/cuenta', iconClass: 'bi bi-person-circle', disabled: false }
    

  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.menuItemsBase.forEach(item => {
      if (item.children?.length && this.isGrupoActivo(item)) {
        this.submenusAbiertos.add(item.route);
      }
    });
  }

  get menuItems() {
    const esAdmin = this.authService.isAdmin();
    return this.menuItemsBase.filter(item => !item.adminOnly || esAdmin);
  }

  isGrupoActivo(item: MenuItem): boolean {
    return this.router.url === item.route || this.router.url.startsWith(item.route + '/');
  }

  isSubmenuAbierto(item: MenuItem): boolean {
    return this.submenusAbiertos.has(item.route);
  }

  toggleSubmenu(item: MenuItem): void {
    if (!item.children?.length) return;

    if (this.submenusAbiertos.has(item.route)) {
      this.submenusAbiertos.delete(item.route);
    } else {
      this.submenusAbiertos.add(item.route);
    }
  }

  submenuId(item: MenuItem): string {
    return 'submenu-' + item.route.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
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