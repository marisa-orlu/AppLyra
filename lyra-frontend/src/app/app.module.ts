import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { BibliotecaComponent } from './components/biblioteca/biblioteca.component';
import { ListadoLibrosComponent } from './components/Libros/listado-libros/listado-libros.component';
import { GestionLibrosComponent } from './components/Libros/gestion-libros/gestion-libros.component';

@NgModule({
  declarations: [
    AppComponent,
    BibliotecaComponent,
    ListadoLibrosComponent,
    GestionLibrosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
