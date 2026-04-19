import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { ListadoLibrosComponent } from './components/Libros/listado-libros/listado-libros.component';
import { EnProcesoComponent } from './components/en-proceso/en-proceso.component';
import { AuthGuard } from './guards/auth.guard';


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
    path: 'usuarios',
    component: EnProcesoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorar',
    component: EnProcesoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'amigos',
    component: EnProcesoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'mi-biblioteca',
    component: EnProcesoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cuenta',
    component: EnProcesoComponent,
    canActivate: [AuthGuard]
  },
  { path: 'biblioteca', redirectTo: 'home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
