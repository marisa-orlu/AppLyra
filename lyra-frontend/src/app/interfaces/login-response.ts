export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  token?: string;
  jwt?: string;
  accessToken?: string;
  role?: string;
  rol?: string;
}
