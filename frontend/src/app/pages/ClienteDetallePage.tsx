import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Mail,
  IdCard,
  Phone,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getClienteById, type Cliente, type Alquiler, type EstadoAlquiler } from '../data/clientesData';

type TabKey = 'datos' | 'alquileres';
type SortField = 'fechaInicio' | 'fechaFin';
type SortDir = 'asc' | 'desc';

const ESTADO_META: Record<EstadoAlquiler, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  activo: { label: 'Activo', bg: 'bg-green-100', text: 'text-green-800', icon: Clock },
  vencido: { label: 'Vencido', bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  entregado: { label: 'Entregado', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2 },
  entregado_tardio: { label: 'Entregado tarde', bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
};

const ESTADOS_FILTRO: Array<{ key: EstadoAlquiler | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'vencido', label: 'Vencidos' },
  { key: 'entregado', label: 'Entregados' },
  { key: 'entregado_tardio', label: 'Entregados tarde' },
];

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto);
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [tab, setTab] = useState<TabKey>('datos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoAlquiler | 'todos'>('todos');
  const [sortField, setSortField] = useState<SortField>('fechaInicio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const found = await getClienteById(Number(id));
        
        if (!found) {
          navigate('/app/clientes', { replace: true });
          return;
        }
        
        setCliente(found);
      } catch (error) {
        console.error("Error obteniendo el cliente:", error);
        navigate('/app/clientes', { replace: true });
      }
    };
    
    fetchCliente();
  }, [id, navigate]);
  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 font-medium">Cargando cliente...</p>
      </div>
    );
  }
  const alquileresFiltrados = cliente.alquileres
    .filter((a) => filtroEstado === 'todos' || a.estado === filtroEstado)
    .sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      const cmp = va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalGastado = cliente.alquileres.reduce((sum, a) => sum + a.monto, 0);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={14} className="text-[#218a72]" />
    ) : (
      <ArrowDown size={14} className="text-[#218a72]" />
    );
  }

  return (
    <div className="pb-10">
      {/* Encabezado del cliente */}
      <div className="bg-gradient-to-br from-[#29a285] via-[#218a72] to-[#1b6f5c] px-5 pt-4 pb-6 text-white">
        <button
          onClick={() => navigate('/app/clientes')}
          className="flex items-center gap-1.5 text-white/80 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-1 py-0.5 transition-colors"
          aria-label="Volver a clientes"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="text-sm font-medium">Clientes</span>
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0 border-2 border-white/30"
            aria-hidden="true"
          >
            {cliente.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight">{cliente.nombre}</h1>
            <p className="text-white/70 text-sm mt-0.5">
              {cliente.alquileres.length} alquiler{cliente.alquileres.length !== 1 ? 'es' : ''} · {formatMonto(totalGastado)} total
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-200 bg-white sticky top-0 z-10" role="tablist" aria-label="Secciones del cliente">
        <button
          role="tab"
          aria-selected={tab === 'datos'}
          aria-controls="panel-datos"
          onClick={() => setTab('datos')}
          className={`flex-1 py-3.5 text-sm font-bold transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#218a72] ${
            tab === 'datos'
              ? 'text-[#218a72] border-b-2 border-[#218a72] -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Datos
        </button>
        <button
          role="tab"
          aria-selected={tab === 'alquileres'}
          aria-controls="panel-alquileres"
          onClick={() => setTab('alquileres')}
          className={`flex-1 py-3.5 text-sm font-bold transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#218a72] ${
            tab === 'alquileres'
              ? 'text-[#218a72] border-b-2 border-[#218a72] -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Alquileres ({cliente.alquileres.length})
        </button>
      </div>

      {/* Panel Datos */}
      {tab === 'datos' && (
        <div id="panel-datos" role="tabpanel" aria-label="Datos del cliente" className="px-5 py-6 space-y-4">
          <div className="bg-white border-2 border-gray-100 rounded-2xl divide-y-2 divide-gray-100">
            <InfoRow icon={IdCard} label="DNI" value={cliente.dni} />
            <InfoRow icon={Mail} label="Correo" value={cliente.email} isEmail />
            {cliente.telefono && <InfoRow icon={Phone} label="Teléfono" value={cliente.telefono} />}
            <InfoRow icon={Package} label="Total alquileres" value={String(cliente.alquileres.length)} />
          </div>

          {/* Resumen por estado */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Resumen de alquileres</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ESTADO_META) as EstadoAlquiler[]).map((estado) => {
                const count = cliente.alquileres.filter((a) => a.estado === estado).length;
                const meta = ESTADO_META[estado];
                return (
                  <div
                    key={estado}
                    className={`${meta.bg} rounded-xl p-4 flex items-center gap-3`}
                    aria-label={`${meta.label}: ${count}`}
                  >
                    <meta.icon size={20} className={meta.text} aria-hidden="true" />
                    <div>
                      <div className={`font-extrabold text-xl ${meta.text}`}>{count}</div>
                      <div className={`text-xs font-semibold ${meta.text} opacity-80`}>{meta.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Panel Alquileres */}
      {tab === 'alquileres' && (
        <div id="panel-alquileres" role="tabpanel" aria-label="Alquileres del cliente" className="px-5 py-4 space-y-4">
          {/* Filtro por estado */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal size={15} className="text-gray-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Filtrar por estado</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filtros de estado">
              {ESTADOS_FILTRO.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFiltroEstado(key as EstadoAlquiler | 'todos')}
                  aria-pressed={filtroEstado === key}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                    filtroEstado === key
                      ? 'bg-[#218a72] text-white border-[#218a72]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#218a72]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de ordenamiento */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown size={15} className="text-gray-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Ordenar por</span>
            </div>
            <div className="flex gap-2" role="group" aria-label="Ordenar alquileres">
              <button
                onClick={() => toggleSort('fechaInicio')}
                aria-pressed={sortField === 'fechaInicio'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                  sortField === 'fechaInicio'
                    ? 'bg-[#218a72] text-white border-[#218a72]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#218a72]'
                }`}
              >
                Fecha inicio
                <SortIcon field="fechaInicio" />
              </button>
              <button
                onClick={() => toggleSort('fechaFin')}
                aria-pressed={sortField === 'fechaFin'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                  sortField === 'fechaFin'
                    ? 'bg-[#218a72] text-white border-[#218a72]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#218a72]'
                }`}
              >
                Fecha fin
                <SortIcon field="fechaFin" />
              </button>
            </div>
          </div>

          {/* Lista de alquileres */}
          {alquileresFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay alquileres con el filtro seleccionado
            </div>
          ) : (
            <div
              className="space-y-3"
              role="list"
              aria-label={`${alquileresFiltrados.length} alquiler${alquileresFiltrados.length !== 1 ? 'es' : ''}`}
            >
              {alquileresFiltrados.map((alquiler) => (
                <AlquilerCard key={alquiler.id} alquiler={alquiler} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isEmail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isEmail?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Icon size={20} className="text-[#218a72] flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
        {isEmail ? (
          <a href={`mailto:${value}`} className="text-sm font-semibold text-[#218a72] truncate block hover:underline">
            {value}
          </a>
        ) : (
          <div className="text-sm font-semibold text-gray-900 truncate">{value}</div>
        )}
      </div>
    </div>
  );
}

function AlquilerCard({ alquiler }: { alquiler: Alquiler }) {
  const meta = ESTADO_META[alquiler.estado];
  const StatusIcon = meta.icon;

  return (
    <article
      className="bg-white border-2 border-gray-100 rounded-2xl p-4"
      role="listitem"
      aria-label={`${alquiler.equipo}, estado: ${meta.label}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{alquiler.equipo}</h3>
        <span
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${meta.bg} ${meta.text}`}
          aria-hidden="true"
        >
          <StatusIcon size={12} />
          {meta.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="space-y-0.5">
          <div>
            <span className="font-semibold text-gray-700">Inicio:</span> {formatFecha(alquiler.fechaInicio)}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Fin:</span> {formatFecha(alquiler.fechaFin)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-extrabold text-gray-900 text-base">{formatMonto(alquiler.monto)}</div>
        </div>
      </div>
    </article>
  );
}
