import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registro-usuario', redirectTo: 'register', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'biblioteca', pathMatch: 'full' },
  { path: 'home-usuario', redirectTo: 'biblioteca', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
  path: 'biblioteca',
  component: BibliotecaComponent,
  canActivate: [AuthGuard]
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
