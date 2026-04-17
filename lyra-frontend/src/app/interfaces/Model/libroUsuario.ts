import { Libro } from './libro';
import { Usuario } from './usuario';

export interface LibroUsuario {
	id_libro_usuario: number;
	usuario: Usuario;
	libro: Libro;
	estado: string | null;
	fecha_agregacion: string | null;
	is_prestamo: boolean | null;
	puntuacion: number | null;
}
