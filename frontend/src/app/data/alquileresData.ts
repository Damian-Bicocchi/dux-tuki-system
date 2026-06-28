export type EstadoAlquiler = "activo" | "vencido" | "finalizado";

export interface Alquiler {
  id: number;
  cliente: string;
  clienteId: number;
  equipo: string;
  equipoId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAlquiler;
  precio: number;
  cantidad: number;
  deposito: number;
  notas?: string;
}

const alquileres: Alquiler[] = [
  {
    id: 1,
    cliente: "Juan Pérez",
    clienteId: 1,
    equipo: "Cámara Sony A7 III",
    equipoId: "camara-sony-a7",
    fechaInicio: "2026-06-20",
    fechaFin: "2026-06-28",
    estado: "activo",
    precio: 15000,
    cantidad: 1,
    deposito: 20000,
    notas: "Cliente solicita cable HDMI adicional.",
  },
  {
    id: 2,
    cliente: "María González",
    clienteId: 2,
    equipo: "Micrófono Rode NTG3",
    equipoId: "microfono-rode",
    fechaInicio: "2026-06-10",
    fechaFin: "2026-06-18",
    estado: "vencido",
    precio: 8000,
    cantidad: 2,
    deposito: 10000,
  },
  {
    id: 3,
    cliente: "Carlos López",
    clienteId: 3,
    equipo: "Kit de luces LED",
    equipoId: "luces-led",
    fechaInicio: "2026-06-22",
    fechaFin: "2026-06-30",
    estado: "activo",
    precio: 12000,
    cantidad: 1,
    deposito: 15000,
    notas: "Coordinar entrega en estudio.",
  },
  {
    id: 4,
    cliente: "Ana Martínez",
    clienteId: 4,
    equipo: "Trípode Manfrotto",
    equipoId: "tripode-manfrotto",
    fechaInicio: "2026-05-28",
    fechaFin: "2026-05-30",
    estado: "finalizado",
    precio: 5000,
    cantidad: 2,
    deposito: 0,
  },
  {
    id: 5,
    cliente: "Roberto Sánchez",
    clienteId: 5,
    equipo: "Gimbal DJI RS3",
    equipoId: "gimbal-dji",
    fechaInicio: "2026-06-15",
    fechaFin: "2026-06-21",
    estado: "vencido",
    precio: 11000,
    cantidad: 1,
    deposito: 12000,
  },
  {
    id: 6,
    cliente: "Laura Torres",
    clienteId: 6,
    equipo: "Monitor SmallHD 4K",
    equipoId: "monitor-smallhd",
    fechaInicio: "2026-06-25",
    fechaFin: "2026-07-02",
    estado: "activo",
    precio: 18000,
    cantidad: 1,
    deposito: 25000,
    notas: "Requiere funda de transporte incluida.",
  },
];

export function getAlquileres(): Alquiler[] {
  return alquileres;
}

export function getAlquilerById(id: number): Alquiler | undefined {
  return alquileres.find((a) => a.id === id);
}

export function calcularDias(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T00:00:00`);
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}
