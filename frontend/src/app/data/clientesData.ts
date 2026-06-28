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

const initialClientes: Cliente[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@email.com',
    dni: '35123456',
    telefono: '11-4523-7890',
    alquileres: [
      { id: 1, equipo: 'Cámara Sony A7 III', fechaInicio: '2026-03-10', fechaFin: '2026-03-15', estado: 'entregado', monto: 12000 },
      { id: 2, equipo: 'Trípode Manfrotto', fechaInicio: '2026-04-20', fechaFin: '2026-04-22', estado: 'entregado', monto: 3000 },
      { id: 3, equipo: 'Micrófono Rode NT1', fechaInicio: '2026-05-28', fechaFin: '2026-06-10', estado: 'activo', monto: 8000 },
      { id: 4, equipo: 'Luz LED Aputure 300X', fechaInicio: '2026-02-01', fechaFin: '2026-02-05', estado: 'entregado_tardio', monto: 5000 },
      { id: 5, equipo: 'Dron DJI Mini 3 Pro', fechaInicio: '2026-05-10', fechaFin: '2026-05-20', estado: 'vencido', monto: 15000 },
    ],
  },
  {
    id: 2,
    nombre: 'María González',
    email: 'maria@email.com',
    dni: '38234567',
    telefono: '11-6712-3344',
    alquileres: [
      { id: 6, equipo: 'Cámara Canon R5', fechaInicio: '2026-04-01', fechaFin: '2026-04-05', estado: 'entregado', monto: 18000 },
      { id: 7, equipo: 'Lente 50mm f/1.4', fechaInicio: '2026-05-15', fechaFin: '2026-05-18', estado: 'entregado', monto: 4500 },
      { id: 8, equipo: 'Monitor de campo Atomos', fechaInicio: '2026-06-01', fechaFin: '2026-06-08', estado: 'activo', monto: 7000 },
    ],
  },
  {
    id: 3,
    nombre: 'Carlos López',
    email: 'carlos@email.com',
    dni: '32345678',
    telefono: '11-9934-5678',
    alquileres: [
      { id: 9, equipo: 'Kit de iluminación 3 puntos', fechaInicio: '2026-01-15', fechaFin: '2026-01-18', estado: 'entregado', monto: 9000 },
      { id: 10, equipo: 'Gimbal DJI RS3', fechaInicio: '2026-02-20', fechaFin: '2026-02-25', estado: 'entregado', monto: 6000 },
      { id: 11, equipo: 'Cámara Sony FX3', fechaInicio: '2026-03-10', fechaFin: '2026-03-15', estado: 'entregado_tardio', monto: 22000 },
      { id: 12, equipo: 'Micrófono Sennheiser MKH', fechaInicio: '2026-04-05', fechaFin: '2026-04-10', estado: 'entregado', monto: 8500 },
      { id: 13, equipo: 'Grabadora Zoom F6', fechaInicio: '2026-05-20', fechaFin: '2026-05-28', estado: 'vencido', monto: 5500 },
      { id: 14, equipo: 'Trípode Gitzo', fechaInicio: '2026-06-02', fechaFin: '2026-06-09', estado: 'activo', monto: 4000 },
      { id: 15, equipo: 'Cámara Sony A7 III', fechaInicio: '2026-06-05', fechaFin: '2026-06-12', estado: 'activo', monto: 12000 },
      { id: 16, equipo: 'Pantalla verde 3x3m', fechaInicio: '2026-01-02', fechaFin: '2026-01-04', estado: 'entregado', monto: 2500 },
    ],
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    email: 'ana@email.com',
    dni: '40456789',
    alquileres: [
      { id: 17, equipo: 'Cámara Fuji X-T5', fechaInicio: '2026-04-10', fechaFin: '2026-04-12', estado: 'entregado', monto: 9000 },
      { id: 18, equipo: 'Flash Godox AD600', fechaInicio: '2026-05-25', fechaFin: '2026-06-03', estado: 'vencido', monto: 6500 },
    ],
  },
  {
    id: 5,
    nombre: 'Roberto Sánchez',
    email: 'roberto@email.com',
    dni: '28567890',
    telefono: '11-2278-9900',
    alquileres: [
      { id: 19, equipo: 'Cámara RED KOMODO', fechaInicio: '2026-01-05', fechaFin: '2026-01-10', estado: 'entregado', monto: 45000 },
      { id: 20, equipo: 'Dron DJI Inspire 2', fechaInicio: '2026-02-01', fechaFin: '2026-02-03', estado: 'entregado_tardio', monto: 30000 },
      { id: 21, equipo: 'Lente Sigma 18-35mm', fechaInicio: '2026-03-15', fechaFin: '2026-03-20', estado: 'entregado', monto: 7000 },
      { id: 22, equipo: 'Cámara Sony A7 IV', fechaInicio: '2026-04-01', fechaFin: '2026-04-07', estado: 'entregado', monto: 14000 },
      { id: 23, equipo: 'Micrófono Røde NTG5', fechaInicio: '2026-05-01', fechaFin: '2026-05-04', estado: 'entregado', monto: 6000 },
      { id: 24, equipo: 'Steadicam Tiffen', fechaInicio: '2026-05-10', fechaFin: '2026-05-15', estado: 'entregado', monto: 11000 },
      { id: 25, equipo: 'Kit de luz Nanlite', fechaInicio: '2026-05-20', fechaFin: '2026-05-25', estado: 'entregado', monto: 8000 },
      { id: 26, equipo: 'Monitor 4K SmallHD', fechaInicio: '2026-06-01', fechaFin: '2026-06-07', estado: 'activo', monto: 9500 },
      { id: 27, equipo: 'Grabadora Sound Devices', fechaInicio: '2026-06-03', fechaFin: '2026-06-09', estado: 'activo', monto: 12500 },
      { id: 28, equipo: 'Cámara Canon C70', fechaInicio: '2026-05-28', fechaFin: '2026-06-05', estado: 'vencido', monto: 20000 },
      { id: 29, equipo: 'Dron DJI Avata 2', fechaInicio: '2026-04-15', fechaFin: '2026-04-18', estado: 'entregado', monto: 16000 },
      { id: 30, equipo: 'Cámara Sony ZV-E1', fechaInicio: '2026-03-01', fechaFin: '2026-03-05', estado: 'entregado', monto: 11000 },
    ],
  },
];

export async function getClientes(): Promise<Cliente[]> {
  try {
    const response = await fetch('http://localhost:3001/api/clientes', {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log('Clientes obtenidos del backend:', data);
    
    // Mapeamos los datos al formato correcto
    const clientes: Cliente[] = data.map((json: any) => ({
      id: json.id,
      nombre: json.nombre,
      email: json.email,
      dni: json.dni,
      telefono: json.telefono,
      alquileres: json.alquileres || [],
    }));
    
    console.log('Clientes listos para enviar a React:', clientes);
    return clientes; // Ahora SÍ retorna cuando el array está lleno

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
