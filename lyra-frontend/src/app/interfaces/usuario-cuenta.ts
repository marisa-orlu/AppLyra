export interface UsuarioCuenta {
  id: number;
  nombre: string;
  email: string;
  // puede venir como `fecha_registro` (snake_case) o `fechaRegistro` (camelCase)
  fecha_registro?: string;
  fechaRegistro?: string;
  fotoPerfil?: string | null;
  biografia?: string | null;
  rol?: string;
}

export interface UsuarioActualizarRequest {
  nombre: string;
  email: string;
  biografia: string | null;
  fotoPerfil: string | null;
}
