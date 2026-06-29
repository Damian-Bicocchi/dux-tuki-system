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
    const [alquileres, setAlquileres] = useState<AlquilerResumenApi[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<'todos' | EstadoAlquiler>(
        'todos',
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAlquileres() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los alquileres');
                }

                const data = (await response.json()) as AlquilerResumenApi[];
                if (isMounted) {
                    setAlquileres(data);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : 'Error inesperado',
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadAlquileres();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredAlquileres = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return alquileres.filter((alquiler) => {
            const matchEstado =
                filterEstado === 'todos' || alquiler.estado === filterEstado;
            const matchSearch =
                !term ||
                alquiler.cliente_nombre.toLowerCase().includes(term) ||
                alquiler.id.toString().includes(term);

            return matchEstado && matchSearch;
        });
    }, [alquileres, searchTerm, filterEstado]);

    const stats = useMemo(() => {
        const activos = alquileres.filter(
            (alq) => alq.estado === 'activo',
        ).length;
        const pendientes = alquileres.filter(
            (alq) => alq.estado === 'pendiente',
        ).length;
        const devueltos = alquileres.filter(
            (alq) => alq.estado === 'devuelto',
        ).length;
        const conRecargos = alquileres.filter(
            (alq) => (alq.cierre_total_recargos || 0) > 0,
        ).length;

        return { activos, pendientes, devueltos, conRecargos };
    }, [alquileres]);

    return (
        <div className="px-5 py-6 pb-10 min-h-screen bg-gradient-to-b from-white via-[#f7fbfa] to-white">
            <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1b6f5c] mb-2">
                    Gestión de alquileres
                </p>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    Cada alquiler abre su propia ventana
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                    Desde aquí abrís el detalle del alquiler, marcás qué se
                    devolvió, cargás observaciones y registrás recargos o
                    roturas.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <MetricCard
                    label="Activos"
                    value={stats.activos}
                    tone="bg-green-50 text-green-800 border-green-200"
                />
                <MetricCard
                    label="Pendientes"
                    value={stats.pendientes}
                    tone="bg-amber-50 text-amber-900 border-amber-200"
                />
                <MetricCard
                    label="Devueltos"
                    value={stats.devueltos}
                    tone="bg-slate-50 text-slate-800 border-slate-200"
                />
                <MetricCard
                    label="Con recargos"
                    value={stats.conRecargos}
                    tone="bg-red-50 text-red-800 border-red-200"
                />
            </div>

            <div className="space-y-3 mb-5">
                <div className="relative">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por cliente o número de alquiler..."
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                        aria-label="Buscar alquileres"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter
                        size={18}
                        className="text-gray-500"
                        aria-hidden="true"
                    />
                    <select
                        value={filterEstado}
                        onChange={(e) =>
                            setFilterEstado(
                                e.target.value as 'todos' | EstadoAlquiler,
                            )
                        }
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                        aria-label="Filtrar por estado"
                    >
                        {ESTADOS.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                                {estado.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                    <LoaderCircle
                        className="animate-spin text-[#218a72]"
                        size={30}
                    />
                    <p className="font-medium">
                        Cargando alquileres desde la base de datos...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-red-800">
                    <p className="font-bold mb-2">No se pudo cargar la lista</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Reintentar
                    </button>
                </div>
            ) : filteredAlquileres.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-500">
                    No hay alquileres para los filtros actuales.
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAlquileres.map((alquiler) => (
                        <button
                            key={alquiler.id}
                            onClick={() =>
                                navigate(`/app/alquileres/${alquiler.id}`)
                            }
                            className="w-full text-left bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm hover:border-[#218a72] hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20"
                        >
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#1b6f5c] mb-2">
                                        <Package size={14} aria-hidden="true" />
                                        #
                                        {alquiler.id
                                            .toString()
                                            .padStart(4, '0')}
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900 truncate">
                                        {alquiler.cliente_nombre}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {alquiler.cantidad_items} ítem
                                        {alquiler.cantidad_items !== 1
                                            ? 's'
                                            : ''}{' '}
                                        · {formatMonto(alquiler.precio_total)}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getEstadoStyles(alquiler.estado)}`}
                                >
                                    {alquiler.estado.charAt(0).toUpperCase() +
                                        alquiler.estado.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <InfoPill
                                    icon={User}
                                    label="Cliente"
                                    value={alquiler.cliente_nombre}
                                />
                                <InfoPill
                                    icon={Calendar}
                                    label="Fechas"
                                    value={`${formatFecha(alquiler.fecha_inicio)} → ${formatFecha(alquiler.fecha_fin)}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <InfoPill
                                    icon={BadgeDollarSign}
                                    label="Recargos"
                                    value={formatMonto(
                                        alquiler.cierre_total_recargos || 0,
                                    )}
                                />
                                <InfoPill
                                    icon={ChevronRight}
                                    label="Abrir"
                                    value={
                                        alquiler.cierre_estado_entrega
                                            ? `Cierre ${alquiler.cierre_estado_entrega}`
                                            : 'Cargar cierre'
                                    }
                                    alignRight
                                />
                            </div>
                        </button>
                    ))}
                </div>
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
