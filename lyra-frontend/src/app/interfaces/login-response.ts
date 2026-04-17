export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  token?: string;
  role?: string;
}
