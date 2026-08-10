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

const API_URL = 'http://localhost:3001/api/stock';

import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

export async function getStocks(): Promise<StockItem[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Validar respuesta del servidor (evita crash en React si responde 401 o 500)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener el stock del backend:', error);
    return [];
  }
}

// Crear nuevo artículo directamente en la BD
export async function addStockItem(item: Omit<StockItem, 'id'>): Promise<StockItem> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al guardar el artículo en el stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al agregar artículo al stock:', error);
    throw error;
  }
}

// Editar un artículo existente
export async function updateStockItem(id: number, item: Partial<StockItem>): Promise<StockItem> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al actualizar el artículo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    throw error;
  }
}