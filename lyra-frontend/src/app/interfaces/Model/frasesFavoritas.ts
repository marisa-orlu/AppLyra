import { Libro } from './libro';
import { Usuario } from './usuario';

export interface FrasesFavoritas {
	id_frase: number;
	usuario: Usuario;
	libro: Libro;
	contenido: string | null;
	pagina: number | null;
	fecha: string;
}
