import { UsuarioSeguidorId } from './usuarioSeguidor-id';

export interface UsuarioSeguidor {
	id_usuario: UsuarioSeguidorId['id_usuario'];
	id_seguidor: UsuarioSeguidorId['id_seguidor'];
	fecha: string;
	idUsuario?: number;
	idSeguidor?: number;
}
