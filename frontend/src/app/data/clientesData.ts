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

const STORAGE_KEY = 'tuki-clientes-v2';


export async function getClientes(): Promise<Cliente[]> {
  try {
    const response = await fetch('http://localhost:3001/api/clientes', {
      method: 'GET',
    });
    
    const data = await response.json();
    
    // Mapeamos los datos al formato correcto
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

export function saveClientes(clientes: Cliente[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

export async function getClienteById(id: number): Promise<Cliente | undefined> {
  const clientes = await getClientes();
  return clientes.find((cliente) => cliente.id === id);
}

export async function addCliente(data: Omit<Cliente, 'id' | 'alquileres'>): Promise<Cliente> {
  const clientes = await getClientes();
  const newCliente: Cliente = {
    ...data,
    id: clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1,
    alquileres: [],
  };
  saveClientes([...clientes, newCliente]);
  return newCliente;
}
