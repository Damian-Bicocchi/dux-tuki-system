import { getAuthHeaders } from '../../../../backend/utils/putHeaders';
import type { PermissionKey } from '../../config/permissions';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: PermissionKey[];
  created_at?: string;
}

export interface RoleInput {
  nombre: string;
  descripcion: string;
  permisos: PermissionKey[];
}

const API_URL = 'http://localhost:3001/api/roles';

/**
 * Lee el mensaje de error que devuelve el backend. El errorHandler global
 * responde `{ error }` y los middlewares de auth responden `{ message }`.
 */
async function extraerError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return data.error || data.message || `${fallback} (HTTP ${response.status})`;
}

export async function getRoles(): Promise<Role[]> {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al obtener los roles'));
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function createRole(input: RoleInput): Promise<Role> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al crear el rol'));
  }
  return await response.json();
}

export async function updateRole(id: number, input: RoleInput): Promise<Role> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al actualizar el rol'));
  }
  return await response.json();
}

export async function deleteRole(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(await extraerError(response, 'Error al eliminar el rol'));
  }
}
