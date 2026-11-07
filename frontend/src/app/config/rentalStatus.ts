import type React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Hourglass,
  XCircle,
} from 'lucide-react';

export type EstadoAlquiler =
  | 'pendiente'
  | 'activo'
  | 'vencido'
  | 'devuelto'
  | 'cancelado';

export const ESTADOS_ALQUILER: EstadoAlquiler[] = [
  'pendiente',
  'activo',
  'vencido',
  'devuelto',
  'cancelado',
];

export interface EstadoAlquilerMeta {
  label: string;
  description: string;
  badge: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
}

export const ESTADO_ALQUILER_META: Record<
  EstadoAlquiler,
  EstadoAlquilerMeta
> = {
  pendiente: {
    label: 'Pendiente',
    description: 'El alquiler está registrado y todavía no comenzó.',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Hourglass,
  },
  activo: {
    label: 'Activo',
    description: 'El cliente tiene el equipo y el alquiler está en curso.',
    badge: 'bg-green-100 text-green-800 border-green-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Clock,
  },
  vencido: {
    label: 'Vencido',
    description: 'La fecha de devolución ya pasó y el equipo no fue devuelto.',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: AlertCircle,
  },
  devuelto: {
    label: 'Devuelto',
    description: 'El alquiler fue devuelto y el inventario fue procesado.',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    description: 'El alquiler fue cancelado antes de su fecha de inicio.',
    badge: 'bg-red-100 text-red-800 border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
  },
};

export const ESTADO_ALQUILER_FILTROS: Array<{
  value: EstadoAlquiler | 'todos';
  label: string;
}> = [
  { value: 'todos', label: 'Todos' },
  ...ESTADOS_ALQUILER.map((estado) => ({
    value: estado,
    label:
      estado === 'pendiente'
        ? 'Pendientes'
        : estado === 'activo'
          ? 'Activos'
          : estado === 'vencido'
            ? 'Vencidos'
            : estado === 'devuelto'
              ? 'Devueltos'
              : 'Cancelados',
  })),
];

export function fechaHoyLocal(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function estadoEfectivoAlquiler(
  estado: EstadoAlquiler,
  fechaFin: string,
  hoy = fechaHoyLocal(),
): EstadoAlquiler {
  if (estado === 'devuelto' || estado === 'cancelado') {
    return estado;
  }

  if (fechaFin && fechaFin < hoy) {
    return 'vencido';
  }

  return estado;
}
