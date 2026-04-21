export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  genero: string | null;
  anio_publicacion: number | null;
  sinopsis: string | null;
  portada: string | null;

  id_usuario_creador?: number | null;
  idUsuarioCreador?: number | null;
  usuarioCreador?: {
    id?: number | null;
    id_usuario?: number | null;
  } | null;
}