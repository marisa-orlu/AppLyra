import { Libro } from './libro';
import { Usuario } from './usuario';

export interface Resena {
	id_resena: number;
	usuario: Usuario;
	libro: Libro;
	texto: string | null;
	puntuacion: number | null;
	fecha_publicacion: string;
}
