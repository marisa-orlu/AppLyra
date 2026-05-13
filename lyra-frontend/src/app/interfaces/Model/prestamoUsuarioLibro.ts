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
	// Algunos endpoints antiguos devolvían un único `usuario` (normalmente la contraparte).
	usuario?: Usuario;

	// DTO más común: incluye dueño y solicitante.
	duenio?: Usuario;
	solicitante?: Usuario;

	// A veces vienen sólo los ids.
	id_duenio?: number;
	id_solicitante?: number;
	idDuenio?: number;
	idSolicitante?: number;

	libro: Libro;

	// snake_case (modelo original)
	fecha_inicio: string | null;
	fecha_fin: string | null;
	// camelCase (DTO)
	fechaInicio?: string | null;
	fechaFin?: string | null;
	estado: PrestamoEstado | null;
}
