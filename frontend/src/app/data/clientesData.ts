export type EstadoAlquiler = 'activo' | 'vencido' | 'entregado' | 'entregado_tardio';

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

export async function getClienteById(id: number): Promise<Cliente | undefined> {
  const clientes = await getClientes();
  return clientes.find((cliente) => cliente.id === id);
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