export type EstadoAlquiler =
  | 'pendiente'
  | 'activo'
  | 'vencido'
  | 'entregado'
  | 'entregado_tardio'
  | 'cancelado';

export interface Alquiler {
  id: number;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAlquiler;
  monto: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  telefono?: string;
  alquileres: Alquiler[];
}

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
      alquileres: json.alquileres || [],
    }));
    
    return clientes;

  } catch (error) {
    console.error('Error al obtener clientes del backend:', error);
    return []; 
  }
}

// Fecha local (YYYY-MM-DD), igual que el backend usa date('now','localtime')
function hoyLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Traduce el estado guardado en la BD (pendiente/activo/vencido/devuelto/cancelado)
// al estado que se muestra en el detalle del cliente.
function mapEstadoAlquiler(json: any): EstadoAlquiler {
  const fechaFin: string = json.fecha_fin;

  if (json.estado === 'cancelado') return 'cancelado';

  if (json.estado === 'devuelto') {
    const fechaCierre: string | null = json.cierre_fecha_cierre
      ? String(json.cierre_fecha_cierre).slice(0, 10)
      : null;
    const tarde =
      (fechaCierre !== null && fechaCierre > fechaFin) ||
      Number(json.cierre_recargo_tarde || 0) > 0;
    return tarde ? 'entregado_tardio' : 'entregado';
  }

  if (json.estado === 'vencido' || fechaFin < hoyLocal()) return 'vencido';

  return json.estado === 'activo' ? 'activo' : 'pendiente';
}

function mapAlquiler(json: any): Alquiler {
  const cantidad = Number(json.cantidad_items || 0);
  return {
    id: json.id,
    equipo:
      json.equipos ||
      (cantidad > 0 ? `${cantidad} artículo${cantidad !== 1 ? 's' : ''}` : 'Sin artículos'),
    fechaInicio: json.fecha_inicio,
    fechaFin: json.fecha_fin,
    estado: mapEstadoAlquiler(json),
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
    alquileres: Array.isArray(json.alquileres) ? json.alquileres.map(mapAlquiler) : [],
  };
}

export async function addCliente(data: Omit<Cliente, 'id' | 'alquileres'>): Promise<Cliente> {
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