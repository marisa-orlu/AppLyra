export interface Libro {
	id: number;
	titulo: string;
	autor: string;
	genero: string | null;
	anio_publicacion: number | null;
	sinopsis: string | null;
	portada: string | null;
}