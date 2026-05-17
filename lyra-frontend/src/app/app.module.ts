import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { ListadoLibrosComponent } from './components/Libros/listado-libros/listado-libros.component';
import { GestionLibrosComponent } from './components/Libros/gestion-libros/gestion-libros.component';
import { DetalleLibroComponent } from './components/Libros/detalle-libro/detalle-libro.component';
import { MenuComponent } from './components/menu/menu.component';
import { EnProcesoComponent } from './components/en-proceso/en-proceso.component';
import { MiBibliotecaComponent } from './components/biblioteca/mi-biblioteca/mi-biblioteca.component';
import { CuentaComponent } from './components/cuenta/cuenta.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { AmigosComponent } from './components/amigos/amigos.component';
import { PrestamosComponent } from './components/prestamos/prestamos.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    BibliotecaComponent,
    ListadoLibrosComponent,
    GestionLibrosComponent,
    DetalleLibroComponent,
    MenuComponent,
    EnProcesoComponent,
    MiBibliotecaComponent,
    CuentaComponent,
    UsuariosComponent,
    AmigosComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PrestamosComponent,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}