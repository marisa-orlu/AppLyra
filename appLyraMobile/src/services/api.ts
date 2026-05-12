import * as SecureStore from 'expo-secure-store';

export const API_URL = 'http://172.30.50.59:8080';


function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function apiOrigin(): string {
  try {
    return new URL(API_URL).origin;
  } catch {
    return API_URL.replace(/\/$/, '');
  }
}

function encodePossiblyUnsafeUrl(input: string): string {
  const raw = (input ?? '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).toString();
  } catch {
    // encodeURI arregla espacios y caracteres no permitidos sin romper los '/'
    try {
      return encodeURI(raw);
    } catch {
      return raw;
    }
  }
}

export function toPublicImageUrl(input: unknown): string {
  const raw = toText(input).trim();
  if (!raw) return '';

  const origin = apiOrigin();

  // Casos típicos en tu back: el DTO viene como "portadas/archivo.jpg" pero el fichero
  // realmente está en la carpeta "uploads".
  // Reescribimos antes de procesar para evitar peticiones a rutas que no existen.
  if (/^\/?portadas\//i.test(raw)) {
    const rest = raw.replace(/^\/?portadas\//i, '');
    return encodePossiblyUnsafeUrl(`${origin}/uploads/${rest.replace(/^\/+/, '')}`);
  }

  // URL absoluta
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      const host = (u.hostname || '').toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
        return encodePossiblyUnsafeUrl(`${origin}${u.pathname}${u.search}`);
      }
      return encodePossiblyUnsafeUrl(u.toString());
    } catch {
      // si no parsea (p.ej. espacios), intentamos codificar
      return encodePossiblyUnsafeUrl(raw);
    }
  }

  // Ruta relativa desde el root del backend
  if (raw.startsWith('/')) {
    return encodePossiblyUnsafeUrl(`${origin}${raw}`);
  }

  // Normaliza separadores y detecta subpath a partir de /uploads/
  const normalized = raw.replace(/\\/g, '/');
  const uploadsMarker = '/uploads/';
  const idx = normalized.toLowerCase().lastIndexOf(uploadsMarker);
  if (idx >= 0) {
    const subPath = normalized.slice(idx);
    return encodePossiblyUnsafeUrl(`${origin}${subPath.startsWith('/') ? '' : '/'}${subPath}`);
  }

  // Empieza por uploads/... (sin / inicial)
  if (/^uploads\//i.test(normalized)) {
    return encodePossiblyUnsafeUrl(`${origin}/${normalized}`);
  }

  // Otras rutas relativas con subcarpetas (p.ej. "images/..", "portadas/..")
  // Si tiene '/' y no parece una ruta de Windows, asumimos que es relativa al root del backend.
  if (normalized.includes('/') && !/^[a-zA-Z]:\//.test(normalized)) {
    return encodePossiblyUnsafeUrl(`${origin}/${normalized.replace(/^\/+/, '')}`);
  }

  // Parece un nombre de fichero, lo asumimos en /uploads/
  // Nota: soporta .jfif y nombres con query/hash.
  const normalizedNoQuery = normalized.split(/[?#]/, 1)[0];
  if (/\.(png|jpe?g|jfif|webp|gif|bmp|avif)$/i.test(normalizedNoQuery)) {
    return encodePossiblyUnsafeUrl(`${origin}/uploads/${normalized.replace(/^\/+/, '')}`);
  }

  // Último recurso: devolver tal cual
  return encodePossiblyUnsafeUrl(raw);
}

export type BibliotecaItem = Record<string, unknown> & {
  id?: number;
  idLibroUsuario?: number;
  estado?: unknown;
  fecha_agregacion?: string | number;
  isPrestamo?: boolean;
  puntuacion?: number | null;
  libro?: Record<string, unknown>;
};

export type LibroDTO = Record<string, unknown> & {
  id?: number;
  titulo?: string;
  autor?: string;
  genero?: string;
  categoria?: string;
  portada?: string;
  imagen?: string;
  urlImagen?: string;
  cover?: string;
};

export type UsuarioDTO = Record<string, unknown> & {
  id?: number;
  nombre?: string;
  email?: string;
  biografia?: string;
  fotoPerfil?: string;
  fechaRegistro?: string;
  fecha_registro?: string;
  rol?: string;
};

export type PageResponse<T> = {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

type LoginResponse = Record<string, unknown> & { token?: string; jwt?: string; accessToken?: string; access_token?: string; role?: string; rol?: string };

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
}

function decodeBase64UrlToString(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];

  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < padded.length; i++) {
    const c = padded[i];
    if (c === '=') break;
    const idx = alphabet.indexOf(c);
    if (idx < 0) continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  try {
    const TD: any = (globalThis as any).TextDecoder;
    if (TD) {
      return new TD('utf-8').decode(new Uint8Array(bytes));
    }
  } catch {
    // ignore
  }

  // Fallback simple
  return String.fromCharCode(...bytes);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const json = decodeBase64UrlToString(parts[1]);
    const payload = JSON.parse(json) as Record<string, unknown>;
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

export async function getStoredUserId(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync('userId');
    if (stored) return stored;
  } catch {
    // ignore
  }

  const token = await getAuthToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const candidates: unknown[] = [
    payload['id'],
    payload['userId'],
    payload['usuarioId'],
    payload['id_usuario'],
    payload['uid'],
    payload['sub'],
  ];

  for (const c of candidates) {
    const n = typeof c === 'string' ? Number(c) : Number(c as unknown);
    if (Number.isFinite(n) && n > 0) {
      const id = String(n);
      try {
        await SecureStore.setItemAsync('userId', id);
      } catch {
        // ignore
      }
      return id;
    }
  }

  return null;
}

async function apiFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let detail = '';
    try {
      const text = await response.text();
      detail = text ? ` - ${text}` : '';
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${response.status}${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function login(email: string, contrasena: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, contrasena })
  });

  if (!response.ok) {
    throw new Error("Error en login");
  }

  return (await response.json()) as LoginResponse;
}

export async function getBibliotecaUsuario(idUsuario: string | number): Promise<BibliotecaItem[]> {
  return await apiFetchJson<BibliotecaItem[]>(`/biblioteca/usuario/${idUsuario}`, {
    method: 'GET',
  });
}

export async function getLibros(page = 0, size = 50): Promise<PageResponse<LibroDTO>> {
  return await apiFetchJson<PageResponse<LibroDTO>>(`/libros?page=${page}&size=${size}`, {
    method: 'GET',
  });
}

export async function getLibroById(idLibro: string | number): Promise<LibroDTO> {
  return await apiFetchJson<LibroDTO>(`/libros/${idLibro}`, {
    method: 'GET',
  });
}


export async function getUsuarioById(idUsuario: string | number): Promise<UsuarioDTO> {
  return await apiFetchJson<UsuarioDTO>(`/usuarios/${idUsuario}`,
    {
      method: 'GET',
    });
}
export default { login, getBibliotecaUsuario, getLibros, getLibroById, getUsuarioById };
