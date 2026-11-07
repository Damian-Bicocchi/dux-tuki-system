import type { EstadoAlquiler } from '../config/rentalStatus';
import { estadoEfectivoAlquiler, fechaHoyLocal } from '../config/rentalStatus';

export type { EstadoAlquiler } from '../config/rentalStatus';

export interface Alquiler {
  id: number;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAlquiler;
  entregaTardia?: boolean;
  monto: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  telefono?: string;
  notas?: string | null;
  alquileres: Alquiler[];
}

export type ClienteInput = Omit<Cliente, 'id' | 'alquileres'>;

const API_URL = 'http://localhost:3001/api/clientes';

// Función auxiliar para obtener las cabeceras con el token JWT
import { getAuthHeaders } from '../../../../backend/utils/putHeaders';


export async function getClientes(): Promise<Cliente[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(), // 1. Adjunta el token
    });
    
    // 2. Si la respuesta no es OK (ej: 401, 403, 500), maneja el error sin romper la app
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // 3. Garantiza que data sea un array antes de mapear
    if (!Array.isArray(data)) {
      return [];
    }

    const clientes: Cliente[] = data.map((json: any) => ({
      id: json.id,
      nombre: json.nombre,
      email: json.email,
      dni: json.dni,
      telefono: json.telefono,
      notas: json.notas,
      alquileres: json.alquileres || [],
    }));
    
    return clientes;

  } catch (error) {
    console.error('Error al obtener clientes del backend:', error);
    return []; 
  }
}

function mapEstadoAlquiler(json: any): EstadoAlquiler {
  return estadoEfectivoAlquiler(
    json.estado as EstadoAlquiler,
    json.fecha_fin,
    fechaHoyLocal(),
  );
}

function mapAlquiler(json: any): Alquiler {
  const cantidad = Number(json.cantidad_items || 0);
  const entregaTardia =
    json.estado === 'devuelto' &&
    ((json.cierre_fecha_cierre &&
      String(json.cierre_fecha_cierre).slice(0, 10) > json.fecha_fin) ||
      Number(json.cierre_recargo_tarde || 0) > 0);

  return {
    id: json.id,
    equipo:
      json.equipos ||
      (cantidad > 0 ? `${cantidad} artículo${cantidad !== 1 ? 's' : ''}` : 'Sin artículos'),
    fechaInicio: json.fecha_inicio,
    fechaFin: json.fecha_fin,
    estado: mapEstadoAlquiler(json),
    entregaTardia: Boolean(entregaTardia),
    monto: Number(json.precio_total || 0),
  };
}

export async function getClienteById(id: number): Promise<Cliente | undefined> {
  // Se usa el endpoint de detalle: es el único que devuelve el historial de alquileres
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return undefined;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error HTTP: ${response.status}`);
  }

  const json = await response.json();
  return {
    id: json.id,
    nombre: json.nombre,
    email: json.email,
    dni: json.dni,
    telefono: json.telefono,
    notas: json.notas,
    alquileres: Array.isArray(json.alquileres) ? json.alquileres.map(mapAlquiler) : [],
  };
}

export async function updateCliente(
  id: number,
  data: ClienteInput,
): Promise<Omit<Cliente, 'alquileres'>> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar el cliente');
  }

  return await response.json();
}

export async function addCliente(data: ClienteInput): Promise<Cliente> {
  try {
    // Migrado a POST en el backend con autenticación
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al guardar el cliente');
    }

    const newCliente = await response.json();
    return newCliente;
  } catch (error) {
    console.error('Error al agregar cliente:', error);
    throw error;
  }
}