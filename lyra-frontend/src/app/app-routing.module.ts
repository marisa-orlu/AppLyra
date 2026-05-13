import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { DetalleLibroComponent } from './components/Libros/detalle-libro/detalle-libro.component';
import { ListadoLibrosComponent } from './components/Libros/listado-libros/listado-libros.component';
import { GestionLibrosComponent } from './components/Libros/gestion-libros/gestion-libros.component';
import { EnProcesoComponent } from './components/en-proceso/en-proceso.component';
import { ExplorarComponent } from './components/explorar/explorar.component';
import { AuthGuard } from './guards/auth.guard';
import { MiBibliotecaComponent } from './components/biblioteca/mi-biblioteca/mi-biblioteca.component';
import { CuentaComponent } from './components/cuenta/cuenta.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { AdminGuard } from './guards/admin.guard';
import { AmigosComponent } from './components/amigos/amigos.component';
import { PrestamosComponent } from './components/prestamos/prestamos.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registro-usuario', redirectTo: 'register', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home-usuario', redirectTo: 'home', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'home',
    component: BibliotecaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'libros',
    component: ListadoLibrosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'libros/nuevo',
    component: GestionLibrosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'libros/editar/:id',
    component: GestionLibrosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'libros/:id',
    component: DetalleLibroComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'explorar',
    component: ExplorarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'amigos',
    component: AmigosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'prestamos',
    redirectTo: 'prestamos/prestados',
    pathMatch: 'full'
  },
  {
    path: 'prestamos',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'prestados',
        component: PrestamosComponent,
        data: { vista: 'presto' }
      },
      {
        path: 'solicitados',
        component: PrestamosComponent,
        data: { vista: 'solicito' }
      },
      {
        path: 'aceptados',
        component: PrestamosComponent,
        data: { vista: 'aceptados' }
      },
      {
        path: 'devueltos',
        component: PrestamosComponent,
        data: { vista: 'devueltos' }
      }
    ]
  },
  {
    path: 'mi-biblioteca',
    component: MiBibliotecaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cuenta',
    component: CuentaComponent,
    canActivate: [AuthGuard]
  },
  
  { path: 'biblioteca', redirectTo: 'home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
