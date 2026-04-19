import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private router: Router) {}

  get mostrarMenu(): boolean {
    const ruta = this.router.url.split('?')[0];
    const rutasSinMenu = ['/', '/login', '/register', '/registro-usuario'];
    return !rutasSinMenu.includes(ruta);
  }
}

