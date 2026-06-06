import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Search, Filter, X, Calendar, Package, User, DollarSign, Clock } from 'lucide-react';

interface Alquiler {
  id: number;
  cliente: string;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'vencido' | 'finalizado';
  precio: number;
}

function changeStateToFinalizado(id: number) {
  {"Aquí iría la lógica para cambiar el estado del alquiler a 'finalizado' en tu backend o estado global."}
}

function calcularDias(inicio: string, fin: string): number {
  const diff = new Date(fin).getTime() - new Date(inicio).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const MODAL_HEADING_ID = 'resumen-alquiler-titulo';

function ResumenAlquilerModal({
  alquiler,
  onClose,
  returnFocusTo,
}: {
  alquiler: Alquiler;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
}) {
  const dias = calcularDias(alquiler.fechaInicio, alquiler.fechaFin);
  const precioPorDia = Math.round(alquiler.precio / dias);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Foco inicial y trap de teclado
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));

        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurar foco al elemento que abrió el modal
      returnFocusTo?.focus();
    };
  }, [onClose, returnFocusTo]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-300';
      case 'finalizado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay — oculto para lectores de pantalla */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel del diálogo */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_HEADING_ID}
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Handle decorativo */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-gray-100">
          <h2 id={MODAL_HEADING_ID} className="font-bold text-xl text-gray-900">
            Resumen del alquiler
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72] focus:ring-offset-2"
            aria-label="Cerrar resumen del alquiler"
          >
            <X size={18} className="text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-4">
          {/* Estado */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500" id="estado-label">Estado</span>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getEstadoColor(alquiler.estado)}`}
              aria-describedby="estado-label"
            >
              {alquiler.estado.charAt(0).toUpperCase() + alquiler.estado.slice(1)}
            </span>
          </div>

          {/* Cliente */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-10 h-10 bg-[#29a285]/10 rounded-xl flex items-center justify-center" aria-hidden="true">
              <User size={20} className="text-[#29a285]" />
            </div>
            <div>
              <div className="text-xs text-gray-500" id="cliente-label">Cliente</div>
              <div className="font-bold text-gray-900" aria-labelledby="cliente-label">{alquiler.cliente}</div>
            </div>
          </div>

          {/* Equipo */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-10 h-10 bg-[#f5e663]/40 rounded-xl flex items-center justify-center" aria-hidden="true">
              <Package size={20} className="text-[#1b6f5c]" />
            </div>
            <div>
              <div className="text-xs text-gray-500" id="equipo-label">Equipo</div>
              <div className="font-bold text-gray-900" aria-labelledby="equipo-label">{alquiler.equipo}</div>
            </div>
          </div>

          {/* Fechas */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center" aria-hidden="true">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1" id="periodo-label">Período</div>
              <div
                className="flex gap-2 text-sm font-semibold text-gray-800"
                aria-labelledby="periodo-label"
                aria-label={`Desde ${new Date(alquiler.fechaInicio).toLocaleDateString('es-AR')} hasta ${new Date(alquiler.fechaFin).toLocaleDateString('es-AR')}`}
              >
                <span>{new Date(alquiler.fechaInicio).toLocaleDateString('es-AR')}</span>
                <span aria-hidden="true" className="text-gray-400">→</span>
                <span>{new Date(alquiler.fechaFin).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Duración y precio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-gray-400" aria-hidden="true" />
                <div className="text-xs text-gray-500" id="duracion-label">Duración</div>
              </div>
              <div className="font-extrabold text-xl text-gray-900" aria-labelledby="duracion-label">
                {dias} días
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ${precioPorDia.toLocaleString('es-AR')}/día
              </div>
            </div>

            <div className="bg-[#218a72]/5 border-2 border-[#218a72]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-[#1b6f5c]" aria-hidden="true" />
                <div className="text-xs text-gray-500" id="total-label">Total</div>
              </div>
              <div className="font-extrabold text-xl text-[#1b6f5c]" aria-labelledby="total-label">
                ${alquiler.precio.toLocaleString('es-AR')}
              </div>
            </div>
          </div>

          {/* Referencia */}
          <div className="text-center text-xs text-gray-400 pb-1">
            <span aria-label={`Número de referencia: ${alquiler.id.toString().padStart(4, '0')}`}>
              Referencia: #{alquiler.id.toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        <div className="pb-6" aria-hidden="true" />
      </div>
    </div>
  );
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
