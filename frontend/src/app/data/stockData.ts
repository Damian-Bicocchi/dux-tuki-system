const STORAGE_KEY = 'tuki-stock-v1';

export interface StockItem {
  id: number;
  nombre: string;
  categoria: string;
  disponibles: number;
  total: number;
}

export type EstadoAlquilerStock = 'activo' | 'vencido' | 'finalizado';

export interface AlquilerDeEquipo {
  id: number;
  cliente: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAlquilerStock;
  precio: number;
}

const initialItems: StockItem[] = [
  { id: 1, nombre: 'Cámara Sony A7 III',     categoria: 'Cámaras',      disponibles: 2, total: 3 },
  { id: 2, nombre: 'Cámara Canon 5D Mark IV', categoria: 'Cámaras',      disponibles: 1, total: 2 },
  { id: 3, nombre: 'Micrófono Rode NTG3',     categoria: 'Audio',        disponibles: 0, total: 2 },
  { id: 4, nombre: 'Trípode Manfrotto',        categoria: 'Accesorios',   disponibles: 4, total: 5 },
  { id: 5, nombre: 'Kit de luces LED',         categoria: 'Iluminación',  disponibles: 1, total: 3 },
  { id: 6, nombre: 'Slider motorizado',        categoria: 'Accesorios',   disponibles: 2, total: 2 },
  { id: 7, nombre: 'Gimbal DJI RS3',           categoria: 'Estabilizadores', disponibles: 1, total: 2 },
  { id: 8, nombre: 'Monitor SmallHD 4K',       categoria: 'Video',        disponibles: 0, total: 1 },
];

// Alquileres asociados a cada item, indexados por id de item
export const alquileresPorItem: Record<number, AlquilerDeEquipo[]> = {
  1: [
    { id: 1,  cliente: 'Juan Pérez',      fechaInicio: '2026-05-01', fechaFin: '2026-05-05', estado: 'finalizado', precio: 15000 },
    { id: 9,  cliente: 'Roberto Sánchez', fechaInicio: '2026-05-20', fechaFin: '2026-05-27', estado: 'finalizado', precio: 15000 },
    { id: 10, cliente: 'Laura Torres',    fechaInicio: '2026-06-01', fechaFin: '2026-06-10', estado: 'activo',     precio: 15000 },
    { id: 11, cliente: 'Pedro Ruiz',      fechaInicio: '2026-04-10', fechaFin: '2026-04-15', estado: 'finalizado', precio: 15000 },
  ],
  2: [
    { id: 5,  cliente: 'Diego Sosa',      fechaInicio: '2026-04-20', fechaFin: '2026-04-28', estado: 'finalizado', precio: 12000 },
    { id: 12, cliente: 'Sofía Blanco',    fechaInicio: '2026-05-15', fechaFin: '2026-05-25', estado: 'vencido',    precio: 12000 },
    { id: 13, cliente: 'Ana Martínez',    fechaInicio: '2026-06-05', fechaFin: '2026-06-12', estado: 'activo',     precio: 12000 },
  ],
  3: [
    { id: 2,  cliente: 'María González',  fechaInicio: '2026-04-25', fechaFin: '2026-05-01', estado: 'vencido',    precio: 8000  },
    { id: 14, cliente: 'Carlos López',    fechaInicio: '2026-05-10', fechaFin: '2026-05-18', estado: 'finalizado', precio: 8000  },
    { id: 15, cliente: 'Valeria Cruz',    fechaInicio: '2026-06-01', fechaFin: '2026-06-08', estado: 'activo',     precio: 8000  },
    { id: 16, cliente: 'Martín Leiva',    fechaInicio: '2026-06-10', fechaFin: '2026-06-15', estado: 'activo',     precio: 8000  },
  ],
  4: [
    { id: 4,  cliente: 'Ana Martínez',    fechaInicio: '2026-04-28', fechaFin: '2026-04-30', estado: 'finalizado', precio: 5000  },
    { id: 17, cliente: 'Diego Sosa',      fechaInicio: '2026-05-05', fechaFin: '2026-05-10', estado: 'finalizado', precio: 5000  },
    { id: 18, cliente: 'Lucía Méndez',    fechaInicio: '2026-05-20', fechaFin: '2026-05-22', estado: 'finalizado', precio: 5000  },
    { id: 19, cliente: 'Pedro Ruiz',      fechaInicio: '2026-06-02', fechaFin: '2026-06-07', estado: 'vencido',    precio: 5000  },
  ],
  5: [
    { id: 3,  cliente: 'Carlos López',    fechaInicio: '2026-05-02', fechaFin: '2026-05-08', estado: 'finalizado', precio: 12000 },
    { id: 20, cliente: 'Roberto Sánchez', fechaInicio: '2026-05-18', fechaFin: '2026-05-24', estado: 'finalizado', precio: 12000 },
    { id: 21, cliente: 'Juan Pérez',      fechaInicio: '2026-06-03', fechaFin: '2026-06-09', estado: 'vencido',    precio: 12000 },
    { id: 22, cliente: 'Laura Torres',    fechaInicio: '2026-06-07', fechaFin: '2026-06-14', estado: 'activo',     precio: 12000 },
  ],
  6: [
    { id: 23, cliente: 'Sofía Blanco',    fechaInicio: '2026-03-15', fechaFin: '2026-03-20', estado: 'finalizado', precio: 9000  },
    { id: 24, cliente: 'Valeria Cruz',    fechaInicio: '2026-04-01', fechaFin: '2026-04-05', estado: 'finalizado', precio: 9000  },
  ],
  7: [
    { id: 25, cliente: 'Martín Leiva',    fechaInicio: '2026-05-10', fechaFin: '2026-05-15', estado: 'finalizado', precio: 11000 },
    { id: 26, cliente: 'Carlos López',    fechaInicio: '2026-06-02', fechaFin: '2026-06-09', estado: 'activo',     precio: 11000 },
  ],
  8: [
    { id: 27, cliente: 'Roberto Sánchez', fechaInicio: '2026-05-25', fechaFin: '2026-06-01', estado: 'vencido',    precio: 18000 },
    { id: 28, cliente: 'Pedro Ruiz',      fechaInicio: '2026-06-05', fechaFin: '2026-06-11', estado: 'activo',     precio: 18000 },
  ],
};

export function calcularEstado(disponibles: number, total: number): 'disponible' | 'bajo' | 'agotado' {
  if (disponibles === 0) return 'agotado';
  if (disponibles <= total * 0.3) return 'bajo';
  return 'disponible';
}

export function getStockItems(): StockItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialItems;
  } catch {
    return initialItems;
  }
}
const API_URL = 'http://localhost:3001/api';
export async function getStocks(): Promise<StockItem[]> {
    const response = await fetch(`${API_URL}/stock`);
    if (!response.ok) {
        throw new Error('No se pudo cargar el stock');
    }
    return response.json();
}
export function saveStockItems(items: StockItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getStockItemById(id: number): StockItem | undefined {
  return getStockItems().find((i) => i.id === id);
}

export function updateStockItem(updated: StockItem): void {
  const items = getStockItems();
  const idx = items.findIndex((i) => i.id === updated.id);
  if (idx !== -1) {
    items[idx] = updated;
    saveStockItems(items);
  }
}

export function addStockItem(data: Omit<StockItem, 'id'>): StockItem {
  const items = getStockItems();
  const newItem: StockItem = {
    ...data,
    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
  };
  saveStockItems([...items, newItem]);
  return newItem;
}
