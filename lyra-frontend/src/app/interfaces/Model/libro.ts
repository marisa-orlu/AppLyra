export interface Libro {
	id_libro: number;
	titulo_libro: string;
	autor: string;
	genero: string | null;
	anio_publicacion: number | null;
	sinopsis: string | null;
	portada: string | null;
	resenas: unknown[];
	frases: unknown[];
	usuarios_libro: unknown[];
	prestamos: unknown[];
}
