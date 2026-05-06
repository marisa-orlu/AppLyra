import { Libro } from './libro';
import { Usuario } from './usuario';

export type PrestamoEstado =
	| 'PENDIENTE'
	| 'ACEPTADO'
	| 'RECHAZADO'
	| 'DEVUELTO'
	| 'PENDIENTE_DEVOLUCION';

export interface PrestamoUsuarioLibro {
	id_prestamo: number;
	usuario: Usuario;
	libro: Libro;
	fecha_inicio: string | null;
	fecha_fin: string | null;
	estado: PrestamoEstado | null;
}
