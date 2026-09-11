import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

export interface Usuario {
  id: number;
  username: string;
  is_admin: boolean;
  role_id: number | null;
  role_name: string | null;
  created_at?: string;
}

export interface CrearUsuarioInput {
  username: string;
  password: string;
  role_id: number | null;
  is_admin: boolean;
}

export interface AsignarRolInput {
  role_id: number | null;
  is_admin: boolean;
}

const API_URL = 'http://localhost:3001/api/usuarios';

/**
 * Lee el mensaje de error que devuelve el backend. El errorHandler global
 * responde `{ error }` y los middlewares de auth responden `{ message }`.
 */
async function extraerError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return data.error || data.message || `${fallback} (HTTP ${response.status})`;
}

export async function getUsuarios(): Promise<Usuario[]> {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al obtener los usuarios'));
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function crearUsuario(input: CrearUsuarioInput): Promise<Usuario> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al crear el usuario'));
  }
  return await response.json();
}

export async function asignarRol(id: number, input: AsignarRolInput): Promise<Usuario> {
  const response = await fetch(`${API_URL}/${id}/rol`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al asignar el rol'));
  }
  return await response.json();
}
