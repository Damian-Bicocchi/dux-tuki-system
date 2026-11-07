import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Mail,
  IdCard,
  Phone,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
  Pencil,
} from 'lucide-react';
import { getClienteById, type Cliente, type Alquiler, type EstadoAlquiler } from '../data/clientesData';
import {
  ESTADO_ALQUILER_FILTROS,
  ESTADO_ALQUILER_META,
} from '../config/rentalStatus';
import { handleTabListKeyDown } from '../utils/tabListKeyboard';
import { Can } from '../components/ui/Can';
import { ClienteEditModal } from '../components/ClienteEditModal';
import { SuccessModal } from '../components/SuccessModal';

type TabKey = 'datos' | 'alquileres';
type SortField = 'fechaInicio' | 'fechaFin';
type SortDir = 'asc' | 'desc';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

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

  const totalGastado = cliente.alquileres
    .filter((a) => a.estado !== 'cancelado')
    .reduce((sum, a) => sum + a.monto, 0);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function sortStateLabel(field: SortField) {
    if (sortField !== field) return 'sin ordenar';
    return sortDir === 'asc' ? 'más antiguos primero' : 'más recientes primero';
  }

  function sortBadgeLabel(field: SortField) {
    if (sortField !== field) return 'Ordenar';
    return sortDir === 'asc' ? 'Más antiguos' : 'Más recientes';
  }

  return (
    <div className="pb-12 bg-gray-50 min-h-screen">
      {/* Encabezado Homogéneo */}
      <header className="bg-gradient-to-br from-[#1b6f5c] via-[#165a4b] to-[#0f3d33] px-5 pt-5 pb-8 text-white shadow-md">
        <button
          onClick={() => navigate('/app/clientes')}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-5 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-3 py-1.5 transition-colors bg-white/10 text-xs font-semibold w-fit"
          aria-label="Volver a Clientes"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Volver a Clientes</span>
        </button>

        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          
          <div>
            <h1 className="text-xl font-extrabold leading-tight">{cliente.nombre}</h1>
            <p className="text-white/70 text-sm mt-0.5">
              {cliente.alquileres.length} alquiler{cliente.alquileres.length !== 1 ? 'es' : ''} · {formatMonto(totalGastado)} total
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="flex border-b-2 border-gray-200 bg-white sticky top-0 z-10"
        role="tablist"
        aria-label="Secciones del cliente"
        onKeyDown={handleTabListKeyDown}
      >
        <button
          role="tab"
          id="cliente-tab-datos"
          aria-selected={tab === 'datos'}
          aria-controls="panel-datos"
          tabIndex={tab === 'datos' ? 0 : -1}
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
          id="cliente-tab-alquileres"
          aria-selected={tab === 'alquileres'}
          aria-controls="panel-alquileres"
          tabIndex={tab === 'alquileres' ? 0 : -1}
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
        <div
          id="panel-datos"
          role="tabpanel"
          aria-labelledby="cliente-tab-datos"
          className="px-5 py-6 space-y-4 max-w-4xl mx-auto"
        >
          <Can do="permiso_para_editar_clientes">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#218a72] hover:bg-[#1b6f5c] text-white text-sm font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
              >
                <Pencil size={16} aria-hidden="true" />
                Editar datos
              </button>
            </div>
          </Can>

          <div className="bg-white border-2 border-gray-100 rounded-2xl divide-y-2 divide-gray-100 shadow-sm">
            <InfoRow icon={IdCard} label="DNI" value={cliente.dni} />
            <InfoRow icon={Mail} label="Correo" value={cliente.email} isEmail />
            {cliente.telefono && <InfoRow icon={Phone} label="Teléfono" value={cliente.telefono} />}
            <InfoRow icon={Package} label="Total alquileres" value={String(cliente.alquileres.length)} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Resumen de alquileres</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ESTADO_ALQUILER_META) as EstadoAlquiler[]).map((estado) => {
                const count = cliente.alquileres.filter((a) => a.estado === estado).length;
                const meta = ESTADO_ALQUILER_META[estado];
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
        <div
          id="panel-alquileres"
          role="tabpanel"
          aria-labelledby="cliente-tab-alquileres"
          className="px-5 py-4 space-y-4 max-w-4xl mx-auto"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal size={15} className="text-gray-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Filtrar por estado</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filtros de estado">
              {ESTADO_ALQUILER_FILTROS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFiltroEstado(value as EstadoAlquiler | 'todos')}
                  aria-pressed={filtroEstado === value}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                    filtroEstado === value
                      ? 'bg-[#218a72] text-white border-[#218a72]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#218a72]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown size={15} className="text-gray-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Ordenar por</span>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Ordenar alquileres"
            >
              <button
                onClick={() => toggleSort('fechaInicio')}
                aria-pressed={sortField === 'fechaInicio'}
                aria-label={`Ordenar por fecha de inicio, ${sortStateLabel('fechaInicio')}`}
                title={`Fecha de inicio: ${sortStateLabel('fechaInicio')}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                  sortField === 'fechaInicio'
                    ? 'bg-[#218a72] text-white border-[#218a72]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#218a72]'
                }`}
              >
                Fecha inicio
                <span
                  className={`text-[10px] font-semibold ${
                    sortField === 'fechaInicio'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {sortBadgeLabel('fechaInicio')}
                </span>
              </button>
              <button
                onClick={() => toggleSort('fechaFin')}
                aria-pressed={sortField === 'fechaFin'}
                aria-label={`Ordenar por fecha de fin, ${sortStateLabel('fechaFin')}`}
                title={`Fecha de fin: ${sortStateLabel('fechaFin')}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 ${
                  sortField === 'fechaFin'
                    ? 'bg-[#218a72] text-white border-[#218a72]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#218a72]'
                }`}
              >
                Fecha fin
                <span
                  className={`text-[10px] font-semibold ${
                    sortField === 'fechaFin'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {sortBadgeLabel('fechaFin')}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-gray-600 mt-2">
              Tocá una opción para cambiar el orden. La etiqueta indica si se
              muestran primero los alquileres más recientes o los más antiguos.
            </p>
          </div>

          {alquileresFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay alquileres con el filtro seleccionado
            </div>
          ) : (
            <ul
              className="space-y-3"
              aria-label={`${alquileresFiltrados.length} alquiler${alquileresFiltrados.length !== 1 ? 'es' : ''}`}
            >
              {alquileresFiltrados.map((alquiler) => (
                <AlquilerCard key={alquiler.id} alquiler={alquiler} />
              ))}
            </ul>
          )}
        </div>
      )}

      {showEditModal && (
        <ClienteEditModal
          cliente={cliente}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={(actualizado) => {
            setCliente(actualizado);
            setShowEditModal(false);
            setShowEditSuccess(true);
          }}
        />
      )}

      <SuccessModal
        isOpen={showEditSuccess}
        title="Datos actualizados"
        message="La información del cliente se guardó correctamente."
        onClose={() => setShowEditSuccess(false)}
      />
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
  const meta = ESTADO_ALQUILER_META[alquiler.estado];
  const StatusIcon = meta.icon;
  const estadoLabel =
    alquiler.estado === 'devuelto' && alquiler.entregaTardia
      ? 'Devuelto tarde'
      : meta.label;

  return (
    <li className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <Link
        to={`/app/alquileres/${alquiler.id}`}
        className="block p-4 hover:border-[#218a72] focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 transition-colors"
        aria-label={`Ver detalle del alquiler: ${alquiler.equipo}, estado: ${estadoLabel}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{alquiler.equipo}</h3>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${meta.badge}`}
            aria-hidden="true"
          >
            <StatusIcon size={12} />
            {estadoLabel}
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
      </Link>
    </li>
  );
}