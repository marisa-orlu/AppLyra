const API_URL = "http://172.30.50.51:8080";

type LoginResponse = Record<string, unknown> & { token?: string; jwt?: string; accessToken?: string; access_token?: string; role?: string; rol?: string };

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

export default { login };
