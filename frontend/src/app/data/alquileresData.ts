import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

export type EstadoAlquiler =
  | 'pendiente'
  | 'activo'
  | 'vencido'
  | 'devuelto'
  | 'cancelado';

export interface AlquilerResumen {
  id: number;
  cliente_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoAlquiler;
  precio_total: number;
  cantidad_items: number;
}

const API_URL = 'http://localhost:3001/api/alquileres';

/**
 * Obtiene los alquileres reales del backend.
 *
 * El backend ya devuelve el estado efectivo (marca como `vencido` los
 * alquileres pendientes/activos cuya fecha_fin ya pasó), por lo que el
 * dashboard debe usar esta lista en lugar de los datos mock.
 */
export async function getAlquileres(): Promise<AlquilerResumen[]> {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error HTTP: ${response.status}`,
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
