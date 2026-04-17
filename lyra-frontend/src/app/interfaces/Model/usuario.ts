export interface Usuario {
	id: number;
	nombre: string;
	email: string;
	contrasena: string;
	fechaRegistro: string;
	fotoPerfil: string | null;
	biografia: string | null;
	rol: 'ADMIN' | 'USER';
	resenas: unknown[];
	frases: unknown[];
	librosUsuario: unknown[];
	prestamos: unknown[];
}
