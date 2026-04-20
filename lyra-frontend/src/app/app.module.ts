import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { ListadoLibrosComponent } from './components/Libros/listado-libros/listado-libros.component';
import { GestionLibrosComponent } from './components/Libros/gestion-libros/gestion-libros.component';
import { DetalleLibroComponent } from './components/Libros/detalle-libro/detalle-libro.component';
import { MenuComponent } from './components/menu/menu.component';
import { EnProcesoComponent } from './components/en-proceso/en-proceso.component';
import { MiBibliotecaComponent } from './components/biblioteca/mi-biblioteca/mi-biblioteca.component';

@NgModule({
  declarations: [
    AppComponent,
    BibliotecaComponent,
    ListadoLibrosComponent,
    GestionLibrosComponent,
    DetalleLibroComponent,
    MenuComponent,
    EnProcesoComponent,
    MiBibliotecaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
