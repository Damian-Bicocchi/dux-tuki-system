import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    BadgeDollarSign,
    Calendar,
    ChevronRight,
    Filter,
    LoaderCircle,
    Package,
    RefreshCw,
    Search,
    User,
} from 'lucide-react';

type EstadoAlquiler = 'pendiente' | 'activo' | 'devuelto' | 'cancelado';

interface AlquilerResumenApi {
    id: number;
    cliente_nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: EstadoAlquiler;
    precio_total: number;
    cantidad_items: number;
    cierre_estado_entrega?: 'pendiente' | 'parcial' | 'cerrado';
    cierre_total_recargos?: number;
}

const API_URL = 'http://localhost:3001/api/alquileres';

const ESTADOS: Array<{ value: EstadoAlquiler | 'todos'; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'activo', label: 'Activos' },
    { value: 'devuelto', label: 'Devueltos' },
    { value: 'cancelado', label: 'Cancelados' },
];

function formatFecha(fecha: string) {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatMonto(monto: number) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
    }).format(monto || 0);
}

function getEstadoStyles(estado: EstadoAlquiler) {
    switch (estado) {
        case 'pendiente':
            return 'bg-amber-100 text-amber-900 border-amber-300';
        case 'activo':
            return 'bg-green-100 text-green-800 border-green-300';
        case 'devuelto':
            return 'bg-slate-100 text-slate-800 border-slate-300';
        case 'cancelado':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-300';
    }
}

export default function AlquileresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [alquilerSeleccionado, setAlquilerSeleccionado] = useState<Alquiler | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const alquileres: Alquiler[] = [
    { id: 1, cliente: 'Juan Pérez', equipo: 'Cámara Sony A7 III', fechaInicio: '2026-05-01', fechaFin: '2026-05-05', estado: 'activo', precio: 15000 },
    { id: 2, cliente: 'María González', equipo: 'Micrófono Rode NTG3', fechaInicio: '2026-04-25', fechaFin: '2026-05-01', estado: 'vencido', precio: 8000 },
    { id: 3, cliente: 'Carlos López', equipo: 'Kit de luces LED', fechaInicio: '2026-05-02', fechaFin: '2026-05-08', estado: 'activo', precio: 12000 },
    { id: 4, cliente: 'Ana Martínez', equipo: 'Trípode Manfrotto', fechaInicio: '2026-04-28', fechaFin: '2026-04-30', estado: 'finalizado', precio: 5000 },
  ];

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['activo', 'vencido', 'finalizado'].includes(filterParam)) {
      setFilterEstado(filterParam);
    }
  }, [searchParams]);

  const handleFilterChange = (nuevoFiltro: string) => {
    setFilterEstado(nuevoFiltro);
    if (nuevoFiltro === 'todos') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: nuevoFiltro });
    }
  };

  const handleOpenModal = (alq: Alquiler, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setAlquilerSeleccionado(alq);
  };

  const handleCloseModal = () => {
    setAlquilerSeleccionado(null);
  };

  const filteredAlquileres = alquileres.filter(alq => {
    const matchSearch =
      alq.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alq.equipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterEstado === 'todos' || alq.estado === filterEstado;
    return matchSearch && matchFilter;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-300';
      case 'finalizado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="px-5 py-6">
      {/* Buscador y filtros */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o equipo..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar alquileres"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" aria-hidden="true" />
          <select
            value={filterEstado}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="vencido">Vencidos</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>
      </div>

      {/* Conteo para lectores de pantalla */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredAlquileres.length === 0
          ? 'No se encontraron alquileres'
          : `${filteredAlquileres.length} alquiler${filteredAlquileres.length !== 1 ? 'es' : ''} encontrado${filteredAlquileres.length !== 1 ? 's' : ''}`}
      </p>

      {/* Lista de alquileres */}
      <div className="space-y-3 mb-24" role="list" aria-label="Lista de alquileres">
        {filteredAlquileres.length === 0 ? (
          <div className="text-center py-12 text-gray-500" aria-live="polite">
            No se encontraron alquileres
          </div>
        ) : (
          filteredAlquileres.map((alq) => (
            <article
              key={alq.id}
              role="listitem"
              tabIndex={0}
              aria-label={`Alquiler de ${alq.equipo} para ${alq.cliente}, estado ${alq.estado}. Presionar Enter para ver el resumen completo.`}
              onClick={(e) => handleOpenModal(alq, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenModal(alq, e.currentTarget);
                }
              }}
              className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] transition-colors cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#218a72] focus:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{alq.cliente}</h3>
                  <p className="text-sm text-gray-600">{alq.equipo}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border-2 whitespace-nowrap ${getEstadoColor(alq.estado)}`}
                  aria-label={`Estado: ${alq.estado}`}
                >
                  {alq.estado.charAt(0).toUpperCase() + alq.estado.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-semibold">Desde:</span>{' '}
                  <time dateTime={alq.fechaInicio}>{new Date(alq.fechaInicio).toLocaleDateString('es-AR')}</time>
                  {' - '}
                  <span className="font-semibold">Hasta:</span>{' '}
                  <time dateTime={alq.fechaFin}>{new Date(alq.fechaFin).toLocaleDateString('es-AR')}</time>
                </div>
                <div className="font-bold text-gray-900">
                  <button
                    onClick={(e) => { e.stopPropagation(); changeStateToFinalizado(alq.id); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="text-[#218a72] hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-[#218a72] focus:ring-offset-1 rounded px-1"
                    aria-label={`Marcar alquiler de ${alq.equipo} como entregado`}
                  >
                    Entregado
                  </button>
                </div>
                <div className="font-bold text-gray-900" aria-label={`Precio: $${alq.precio.toLocaleString('es-AR')}`}>
                  ${alq.precio.toLocaleString('es-AR')}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => navigate('/app/nuevo-alquiler')}
        className="fixed bottom-8 right-6 bg-[#f5e663] text-[#1b6f5c] rounded-full shadow-xl flex items-center justify-center gap-2 px-6 py-4 hover:scale-105 focus:scale-105 active:scale-95 transition-transform z-30 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#f5e663]/50"
        aria-label="Crear nuevo alquiler"
      >
        <Plus size={24} strokeWidth={2.5} aria-hidden="true" />
        <span className="font-bold text-base">Nuevo alquiler</span>
      </button>

      {/* Modal de resumen */}
      {alquilerSeleccionado && (
        <ResumenAlquilerModal
          alquiler={alquilerSeleccionado}
          onClose={handleCloseModal}
          returnFocusTo={triggerRef.current}
        />
      )}
    </div>
  );
}

function MetricCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: string;
}) {
    return (
        <div className={`rounded-2xl border-2 p-4 ${tone}`}>
            <div className="text-2xl font-black leading-none mb-1">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                {label}
            </div>
        </div>
    );
}

function InfoPill({
    icon: Icon,
    label,
    value,
    alignRight = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    alignRight?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl bg-gray-50 border border-gray-100 p-3 ${alignRight ? 'text-right' : ''}`}
        >
            <div
                className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 ${alignRight ? 'justify-end' : ''}`}
            >
                <Icon size={13} aria-hidden="true" />
                {label}
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-800 break-words">
                {value}
            </div>
        </div>
    );
}
