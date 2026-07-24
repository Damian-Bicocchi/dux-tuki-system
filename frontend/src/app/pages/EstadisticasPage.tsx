import { TrendingUp, DollarSign, Users, Percent, ClipboardList } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EstadisticasPage() {
  const inversionTotal = 850000;
  const gananciaMensual = 420000;
  const costosOperativos = 85000;
  const gananciaNetaMensual = gananciaMensual - costosOperativos;
  const gananciaAnual = gananciaNetaMensual * 12;
  const roi = ((gananciaAnual / inversionTotal) * 100).toFixed(1);

  const integrantes = [
    { nombre: 'Integrante 1', porcentaje: 40 },
    { nombre: 'Integrante 2', porcentaje: 35 },
    { nombre: 'Integrante 3', porcentaje: 25 },
  ];

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

  const [alquileres, setAlquileres] = useState<AlquilerResumenApi[]>([]);
  const API_URL = 'http://localhost:3001/api/alquileres';

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

  useEffect(() => {
    let isMounted = true;

    async function loadAlquileres() {
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
                
            }
        }
    }

    loadAlquileres();

    return () => {
        isMounted = false;
    };
}, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pieDataROI = [
    { name: 'Ganancia neta mensual', value: gananciaNetaMensual },
    { name: 'Costos operativos', value: costosOperativos },
  ];

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

  const PIE_COLORS = ['#29a285', '#f5e663'];

  const pieDataIntegrantes = integrantes.map((i) => ({
    name: i.nombre,
    value: i.porcentaje,
  }));

  const INTEGRANTE_COLORS = ['#29a285', '#1b6f5c', '#f5e663'];

  const CustomTooltipROI = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm" role="status">
          <p className="font-bold text-gray-800">{payload[0].name}</p>
          <p className="text-[#1b6f5c] font-extrabold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipIntegrantes = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm" role="status">
          <p className="font-bold text-gray-800">{payload[0].name}</p>
          <p className="text-[#1b6f5c] font-extrabold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* ROI */}
      <section aria-labelledby="roi-titulo">
        <div className="bg-gradient-to-br from-[#29a285] to-[#1b6f5c] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center" aria-hidden="true">
              <TrendingUp size={24} />
            </div>
            <h2 id="roi-titulo" className="font-bold text-lg">Retorno de Inversión (ROI)</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-extrabold" aria-label={`${roi} por ciento`}>{roi}%</div>
            <div className="text-lg opacity-90" aria-hidden="true">anual</div>
          </div>
          <p className="mt-3 text-sm opacity-90">
            Basado en inversión de {formatCurrency(inversionTotal)}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#218a72]/10 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <ClipboardList size={20} className="text-[#218a72]" />
                </div>
                <h2 className="font-bold text-lg text-gray-800">Estadísticas de alquileres</h2>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                {stats.activos + stats.pendientes + stats.devueltos + stats.conRecargos} total
            </span>
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
    </section>

      {/* Gráfico de torta — Distribución mensual */}
      <section aria-labelledby="distribucion-titulo" className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#29a285]/10 rounded-xl flex items-center justify-center" aria-hidden="true">
            <TrendingUp size={24} className="text-[#29a285]" />
          </div>
          <div>
            <h2 id="distribucion-titulo" className="font-bold text-lg text-gray-900">Distribución mensual</h2>
            <p className="text-sm text-gray-500">Ganancia neta vs costos operativos</p>
          </div>
        </div>

        {/* Tabla de datos accesible (invisible visualmente, leída por lectores de pantalla) */}
        <table className="sr-only" aria-label="Datos del gráfico de distribución mensual">
          <caption>Distribución mensual de ingresos</caption>
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col">Monto</th>
              <th scope="col">Porcentaje del ingreso</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ganancia neta mensual</td>
              <td>{formatCurrency(gananciaNetaMensual)}</td>
              <td>{((gananciaNetaMensual / gananciaMensual) * 100).toFixed(0)}%</td>
            </tr>
            <tr>
              <td>Costos operativos</td>
              <td>{formatCurrency(costosOperativos)}</td>
              <td>{((costosOperativos / gananciaMensual) * 100).toFixed(0)}%</td>
            </tr>
          </tbody>
        </table>

        {/* Gráfico visual — oculto para lectores de pantalla */}
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieDataROI}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieDataROI.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipROI />} />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-xl p-3 text-center" style={{ background: '#29a28518' }}>
            <div className="text-xs text-gray-600 mb-1">Ganancia neta</div>
            <div className="font-extrabold text-[#1b6f5c]">{formatCurrency(gananciaNetaMensual)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((gananciaNetaMensual / gananciaMensual) * 100).toFixed(0)}% del ingreso
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#f5e66318' }}>
            <div className="text-xs text-gray-600 mb-1">Costos operativos</div>
            <div className="font-extrabold text-gray-700">{formatCurrency(costosOperativos)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((costosOperativos / gananciaMensual) * 100).toFixed(0)}% del ingreso
            </div>
          </div>
        </div>
      </section>

      {/* Ganancias */}
      <section aria-labelledby="ganancias-titulo" className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#f5e663] rounded-xl flex items-center justify-center" aria-hidden="true">
            <DollarSign size={24} className="text-[#1b6f5c]" />
          </div>
          <h2 id="ganancias-titulo" className="font-bold text-lg text-gray-900">Ganancias</h2>
        </div>

        <dl className="space-y-4">
          <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <dt className="text-sm text-gray-600 mb-1">Ganancia mensual bruta</dt>
            <dd className="font-extrabold text-2xl text-gray-900">{formatCurrency(gananciaMensual)}</dd>
          </div>

          <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <dt className="text-sm text-gray-600 mb-1">Costos operativos mensuales</dt>
            <dd className="font-extrabold text-2xl text-red-600">
              <span aria-label={`menos ${formatCurrency(costosOperativos)}`}>
                -{formatCurrency(costosOperativos)}
              </span>
            </dd>
          </div>

          <div className="border-2 border-[#218a72] rounded-xl p-4 bg-[#218a72]/5">
            <dt className="text-sm text-gray-600 mb-1">Ganancia neta mensual</dt>
            <dd className="font-extrabold text-3xl text-[#1b6f5c]">{formatCurrency(gananciaNetaMensual)}</dd>
          </div>

          <div className="border-2 border-[#218a72] rounded-xl p-4 bg-[#218a72]/5">
            <dt className="text-sm text-gray-600 mb-1">Ganancia neta anual proyectada</dt>
            <dd className="font-extrabold text-3xl text-[#1b6f5c]">{formatCurrency(gananciaAnual)}</dd>
          </div>
        </dl>
      </section>

      {/* División de ganancias */}
      <section aria-labelledby="division-titulo" className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center" aria-hidden="true">
            <Users size={24} className="text-purple-600" />
          </div>
          <h2 id="division-titulo" className="font-bold text-lg text-gray-900">División de ganancias</h2>
        </div>

        {/* Tabla accesible del gráfico de integrantes */}
        <table className="sr-only" aria-label="Datos del gráfico de división de ganancias">
          <caption>Porcentaje de participación por integrante</caption>
          <thead>
            <tr>
              <th scope="col">Integrante</th>
              <th scope="col">Participación</th>
              <th scope="col">Ganancia mensual</th>
            </tr>
          </thead>
          <tbody>
            {integrantes.map((integrante) => (
              <tr key={integrante.nombre}>
                <td>{integrante.nombre}</td>
                <td>{integrante.porcentaje}%</td>
                <td>{formatCurrency((gananciaNetaMensual * integrante.porcentaje) / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gráfico visual */}
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieDataIntegrantes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {pieDataIntegrantes.map((_, index) => (
                  <Cell key={index} fill={INTEGRANTE_COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipIntegrantes />} />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-3 mt-4" aria-label="Detalle de ganancias por integrante">
          {integrantes.map((integrante, index) => {
            const gananciaIntegrante = (gananciaNetaMensual * integrante.porcentaje) / 100;

            return (
              <li
                key={index}
                className="border-2 border-gray-100 rounded-xl p-4 hover:border-[#218a72] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold"
                      style={{ background: INTEGRANTE_COLORS[index] }}
                      aria-hidden="true"
                    >
                      {integrante.nombre.charAt(integrante.nombre.length - 1)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{integrante.nombre}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Percent size={12} aria-hidden="true" />
                        <span>{integrante.porcentaje}% de participación</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#218a72]/5 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1" id={`ganancia-label-${index}`}>Ganancia mensual</div>
                  <div
                    className="font-extrabold text-xl text-[#1b6f5c]"
                    aria-labelledby={`ganancia-label-${index}`}
                  >
                    {formatCurrency(gananciaIntegrante)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
          <div className="text-xs text-gray-600 mb-1" id="total-distribuido-label">Total distribuido mensual</div>
          <div className="font-extrabold text-xl text-gray-900" aria-labelledby="total-distribuido-label">
            {formatCurrency(gananciaNetaMensual)}
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <div className="bg-[#f5e663]/20 border-2 border-[#f5e663] rounded-2xl p-4" role="note">
        <p className="text-sm text-gray-700 text-center">
          <strong>Nota:</strong> Estas estadísticas son proyecciones basadas en datos simulados para fines demostrativos.
        </p>
      </div>
    </div>
  );
}
