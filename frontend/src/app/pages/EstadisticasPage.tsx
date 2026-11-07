import {
  AlertCircle,
  ClipboardList,
  LoaderCircle,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

interface ResumenApi {
  mes: string;
  ingresos_brutos: number;
  roi_mensual_porcentaje: number | null;
  roi_anual_porcentaje: number | null;
  inversion_estimada: number;
  total_alquileres: number;
  total_clientes: number;
  alquileres_con_recargos: number;
  alquileres_por_estado: {
    total: number;
    activos: number;
    pendientes: number;
    vencidos: number;
    devueltos: number;
    cancelados: number;
  };
}

interface IngresoMesApi {
  mes: string;
  ingresos: number;
  cantidad_alquileres: number;
}

interface ArticuloTopApi {
  id: number;
  nombre: string;
  categoria: string | null;
  unidades_alquiladas: number;
  veces_alquilado: number;
  ingresos_generados: number;
}

interface ClienteFrecuenteApi {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  total_alquileres: number;
  total_gastado: number | null;
  ultimo_alquiler: string | null;
}

const API_URL = 'http://localhost:3001/api';
const ANIO_ACTUAL = new Date().getFullYear();
const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];


function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return `${Number(value).toFixed(1)}%`;
}

function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return '—';
  const [soloFecha] = fecha.split(' ');
  const partes = soloFecha.split('-');
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : fecha;
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
    <div
      role="listitem"
      aria-label={`${label}: ${value}`}
      className={`rounded-2xl border-2 p-4 ${tone}`}
    >
      <div aria-hidden="true" className="text-2xl font-black leading-none mb-1">
        {value}
      </div>
      <div
        aria-hidden="true"
        className="text-xs font-bold uppercase tracking-wider opacity-80"
      >
        {label}
      </div>
    </div>
  );
}

function CustomCurrencyTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm"
      role="status"
    >
      <p className="font-bold text-gray-800">{payload[0].name}</p>
      <p className="text-[#1b6f5c] font-extrabold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function EstadisticasPage() {
  const [resumen, setResumen] = useState<ResumenApi | null>(null);
  const [ingresosPorMes, setIngresosPorMes] = useState<IngresoMesApi[]>([]);
  const [articulosTop, setArticulosTop] = useState<ArticuloTopApi[]>([]);
  const [clientesFrecuentes, setClientesFrecuentes] = useState<
    ClienteFrecuenteApi[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function cargarEstadisticas() {
      setLoading(true);
      setError(null);

      try {
        const headers = getAuthHeaders();
        const responses = await Promise.all([
          fetch(`${API_URL}/estadisticas/resumen`, { headers }),
          fetch(
            `${API_URL}/estadisticas/ingresos-por-mes?anio=${ANIO_ACTUAL}`,
            { headers },
          ),
          fetch(`${API_URL}/estadisticas/articulos-mas-alquilados?limit=5`, {
            headers,
          }),
          fetch(`${API_URL}/estadisticas/clientes-frecuentes?limit=5`, {
            headers,
          }),
        ]);

        const fallo = responses.find((response) => !response.ok);
        if (fallo) {
          throw new Error(
            `No se pudieron cargar las estadísticas (HTTP ${fallo.status}).`,
          );
        }

        const [
          resumenData,
          ingresosData,
          articulosData,
          clientesFrecuentesData,
        ] = await Promise.all(
          responses.map((response) => response.json()),
        );

        if (cancelled) return;

        setResumen(resumenData as ResumenApi);
        setIngresosPorMes(
          Array.isArray(ingresosData) ? (ingresosData as IngresoMesApi[]) : [],
        );
        setArticulosTop(
          Array.isArray(articulosData) ? (articulosData as ArticuloTopApi[]) : [],
        );
        setClientesFrecuentes(
          Array.isArray(clientesFrecuentesData)
            ? (clientesFrecuentesData as ClienteFrecuenteApi[])
            : [],
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Ocurrió un error inesperado.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarEstadisticas();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => {
    const counts = resumen?.alquileres_por_estado;

    return {
      total: counts?.total ?? 0,
      activos: counts?.activos ?? 0,
      pendientes: counts?.pendientes ?? 0,
      vencidos: counts?.vencidos ?? 0,
      devueltos: counts?.devueltos ?? 0,
      cancelados: counts?.cancelados ?? 0,
    };
  }, [resumen]);

  const totalClientes = Number(resumen?.total_clientes ?? 0);
  const alquileresConRecargos = Number(
    resumen?.alquileres_con_recargos ?? 0,
  );
  const alquileresValidos = stats.total - stats.cancelados;
  const promedioAlquileres =
    totalClientes > 0 ? Math.round(alquileresValidos / totalClientes) : 0;

  const ingresosChartData = useMemo(
    () =>
      MESES_CORTOS.map((label, index) => {
        const mesKey = `${ANIO_ACTUAL}-${String(index + 1).padStart(2, '0')}`;
        const fila = ingresosPorMes.find((item) => item.mes === mesKey);

        return {
          mes: label,
          ingresos: Number(fila?.ingresos ?? 0),
          cantidad_alquileres: Number(fila?.cantidad_alquileres ?? 0),
        };
      }),
    [ingresosPorMes],
  );

  const ingresosBrutos = Number(resumen?.ingresos_brutos ?? 0);
  const inversionEstimada = Number(resumen?.inversion_estimada ?? 0);
  const ingresosTieneDatos = ingresosChartData.some(
    (item) => item.ingresos > 0 || item.cantidad_alquileres > 0,
  );

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center"
      >
        <LoaderCircle
          className="animate-spin text-[#218a72]"
          size={32}
          aria-hidden="true"
        />
        <p className="text-gray-500 font-medium">
          Cargando estadísticas desde la base de datos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="max-w-lg mx-auto mt-10 px-5 py-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold mb-1">No se pudieron cargar las estadísticas</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Anuncio para lectores de pantalla cuando terminan de cargar los datos */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Estadísticas cargadas. {stats.total} alquileres y {totalClientes}{' '}
        clientes registrados.
      </div>

      {/* ROI */}
      <section aria-labelledby="roi-titulo">
        <div className="bg-gradient-to-br from-[#29a285] to-[#1b6f5c] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
              aria-hidden="true"
            >
              <TrendingUp size={24} />
            </div>
            <h2 id="roi-titulo" className="font-bold text-lg">
              Retorno de Inversión (ROI)
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-extrabold" aria-hidden="true">
              {formatPercent(resumen?.roi_anual_porcentaje)}
            </div>
            <div className="text-lg opacity-90" aria-hidden="true">
              anual
            </div>
            <span className="sr-only">
              ROI anual: {formatPercent(resumen?.roi_anual_porcentaje)}
            </span>
          </div>
          <p className="mt-3 text-sm opacity-90">
            {resumen?.roi_mensual_porcentaje !== null &&
            resumen?.roi_mensual_porcentaje !== undefined
              ? `ROI mensual: ${formatPercent(resumen.roi_mensual_porcentaje)} · `
              : ''}
            Ingresos brutos del mes: {formatCurrency(ingresosBrutos)} · Inversión
            estimada del inventario: {formatCurrency(inversionEstimada)}
          </p>
        </div>
      </section>

      {/* Alquileres */}
      <section aria-labelledby="stats-alquileres-titulo">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-[#218a72]/10 rounded-xl flex items-center justify-center"
              aria-hidden="true"
            >
              <ClipboardList size={20} className="text-[#218a72]" />
            </div>
            <h2
              id="stats-alquileres-titulo"
              className="font-bold text-lg text-gray-800"
            >
              Estadísticas de alquileres
            </h2>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            {stats.total} total
          </span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
          role="list"
          aria-label="Resumen de alquileres por estado"
        >
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
            label="Vencidos"
            value={stats.vencidos}
            tone="bg-rose-50 text-rose-800 border-rose-200"
          />
          <MetricCard
            label="Devueltos"
            value={stats.devueltos}
            tone="bg-slate-50 text-slate-800 border-slate-200"
          />
          <MetricCard
            label="Cancelados"
            value={stats.cancelados}
            tone="bg-gray-50 text-gray-700 border-gray-200"
          />
        </div>

        <p className="text-xs text-gray-600 -mt-3 mb-6">
          Alquileres con recargos de cierre:{' '}
          <strong className="text-gray-900">{alquileresConRecargos}</strong>
        </p>
      </section>

      {/* Clientes */}
      <section aria-labelledby="stats-clientes-titulo">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-[#218a72]/10 rounded-xl flex items-center justify-center"
              aria-hidden="true"
            >
              <Users size={20} className="text-[#218a72]" />
            </div>
            <h2
              id="stats-clientes-titulo"
              className="font-bold text-lg text-gray-800"
            >
              Estadísticas de clientes
            </h2>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            {totalClientes} total
          </span>
        </div>

        <div
          className="grid grid-cols-2 gap-3 mb-6"
          role="list"
          aria-label="Estadísticas de clientes"
        >
          <div
            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center"
            role="listitem"
            aria-label={`Total de clientes: ${totalClientes}`}
          >
            <div
              aria-hidden="true"
              className="text-3xl font-extrabold text-blue-800 mb-1"
            >
              {totalClientes}
            </div>
            <div
              aria-hidden="true"
              className="text-xs font-bold text-blue-700 uppercase tracking-wide"
            >
              Total clientes
            </div>
          </div>

          <div
            className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 text-center"
            role="listitem"
            aria-label={`Promedio de alquileres por cliente: ${promedioAlquileres}`}
          >
            <div
              aria-hidden="true"
              className="text-3xl font-extrabold text-purple-800 mb-1"
            >
              {promedioAlquileres}
            </div>
            <div
              aria-hidden="true"
              className="text-xs font-bold text-purple-700 uppercase tracking-wide"
            >
              Prom. alquileres por cliente
            </div>
          </div>
        </div>
      </section>

      {/* Ingresos por mes */}
      <section
        aria-labelledby="ingresos-mes-titulo"
        className="bg-white rounded-2xl border-2 border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 bg-[#29a285]/10 rounded-xl flex items-center justify-center"
            aria-hidden="true"
          >
            <TrendingUp size={24} className="text-[#29a285]" />
          </div>
          <div>
            <h2
              id="ingresos-mes-titulo"
              className="font-bold text-lg text-gray-900"
            >
              Ingresos por mes
            </h2>
            <p className="text-sm text-gray-500">
              Alquileres iniciados en {ANIO_ACTUAL}
            </p>
          </div>
        </div>

        <table
          className="sr-only"
          aria-label={`Datos de ingresos por mes del año ${ANIO_ACTUAL}`}
        >
          <caption>Ingresos mensuales</caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Ingresos</th>
              <th scope="col">Alquileres</th>
            </tr>
          </thead>
          <tbody>
            {ingresosChartData.map((item) => (
              <tr key={item.mes}>
                <td>{item.mes}</td>
                <td>{formatCurrency(item.ingresos)}</td>
                <td>{item.cantidad_alquileres}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {ingresosTieneDatos ? (
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ingresosChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={70} />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="#29a285"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 py-10">
            Todavía no hay alquileres registrados en {ANIO_ACTUAL}.
          </p>
        )}
      </section>

      {/* Artículos más alquilados */}
      <section
        aria-labelledby="articulos-top-titulo"
        className="bg-white rounded-2xl border-2 border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"
            aria-hidden="true"
          >
            <Package size={24} className="text-amber-700" />
          </div>
          <div>
            <h2
              id="articulos-top-titulo"
              className="font-bold text-lg text-gray-900"
            >
              Artículos más alquilados
            </h2>
            <p className="text-sm text-gray-500">
              Ranking histórico de unidades alquiladas
            </p>
          </div>
        </div>

        {articulosTop.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            Todavía no hay artículos alquilados.
          </p>
        ) : (
          <ol className="space-y-3" aria-label="Ranking de artículos más alquilados">
            {articulosTop.map((articulo, index) => (
              <li
                key={articulo.id}
                className="flex items-center gap-3 border-2 border-gray-100 rounded-xl p-4"
              >
                <div
                  className="w-8 h-8 rounded-full bg-[#218a72] text-white flex items-center justify-center font-bold flex-shrink-0"
                  aria-hidden="true"
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {articulo.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {articulo.categoria || 'Sin categoría'} ·{' '}
                    {articulo.veces_alquilado} alquiler
                    {articulo.veces_alquilado !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-[#1b6f5c] text-lg">
                    {articulo.unidades_alquiladas}
                  </p>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Clientes frecuentes */}
      <section
        aria-labelledby="clientes-top-titulo"
        className="bg-white rounded-2xl border-2 border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"
            aria-hidden="true"
          >
            <Users size={24} className="text-purple-600" />
          </div>
          <div>
            <h2
              id="clientes-top-titulo"
              className="font-bold text-lg text-gray-900"
            >
              Clientes frecuentes
            </h2>
            <p className="text-sm text-gray-500">
              Ranking histórico por cantidad de alquileres
            </p>
          </div>
        </div>

        {clientesFrecuentes.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            Todavía no hay clientes con alquileres.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Ranking de clientes frecuentes">
            {clientesFrecuentes.map((cliente, index) => (
              <li
                key={cliente.id}
                className="flex items-center gap-3 border-2 border-gray-100 rounded-xl p-4"
              >
                <div
                  className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0"
                  aria-hidden="true"
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {cliente.nombre}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {cliente.email || cliente.telefono || 'Sin contacto'} · Último: {formatFecha(cliente.ultimo_alquiler)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-900 text-lg">
                    {cliente.total_alquileres}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(Number(cliente.total_gastado || 0))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="bg-[#f5e663]/20 border-2 border-[#f5e663] rounded-2xl p-4" role="note">
        <p className="text-sm text-gray-700 text-center">
          <strong>Datos reales:</strong> estas estadísticas se calculan en tiempo
          real a partir de los alquileres y clientes registrados en la base de
          datos.
        </p>
      </div>
    </div>
  );
}
