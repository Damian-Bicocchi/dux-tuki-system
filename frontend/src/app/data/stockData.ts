const STORAGE_KEY = 'tuki-stock-v1';

export interface StockItem {
  id: number;
  nombre: string;
  categoria: string;
  disponibles: number;
  total: number;
  precio_por_dia: number;
  deposito_garantia: number;
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


export function calcularEstado(disponibles: number, total: number): 'disponible' | 'bajo' | 'agotado' {
  if (disponibles === 0) return 'agotado';
  if (disponibles <= total * 0.3) return 'bajo';
  return 'disponible';
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
