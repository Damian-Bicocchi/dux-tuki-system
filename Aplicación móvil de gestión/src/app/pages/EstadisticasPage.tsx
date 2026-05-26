import { TrendingUp, DollarSign, Users, Percent } from 'lucide-react';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* ROI */}
      <div className="bg-gradient-to-br from-[#29a285] to-[#1b6f5c] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <h2 className="font-bold text-lg">Retorno de Inversión (ROI)</h2>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-extrabold">{roi}%</div>
          <div className="text-lg opacity-90">anual</div>
        </div>
        <p className="mt-3 text-sm opacity-90">
          Basado en inversión de {formatCurrency(inversionTotal)}
        </p>
      </div>

      {/* Ganancias */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#f5e663] rounded-xl flex items-center justify-center">
            <DollarSign size={24} className="text-[#1b6f5c]" />
          </div>
          <h2 className="font-bold text-lg text-gray-900">Ganancias</h2>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="text-sm text-gray-600 mb-1">Ganancia mensual bruta</div>
            <div className="font-extrabold text-2xl text-gray-900">{formatCurrency(gananciaMensual)}</div>
          </div>

          <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="text-sm text-gray-600 mb-1">Costos operativos mensuales</div>
            <div className="font-extrabold text-2xl text-red-600">-{formatCurrency(costosOperativos)}</div>
          </div>

          <div className="border-2 border-[#218a72] rounded-xl p-4 bg-[#218a72]/5">
            <div className="text-sm text-gray-600 mb-1">Ganancia neta mensual</div>
            <div className="font-extrabold text-3xl text-[#1b6f5c]">{formatCurrency(gananciaNetaMensual)}</div>
          </div>

          <div className="border-2 border-[#218a72] rounded-xl p-4 bg-[#218a72]/5">
            <div className="text-sm text-gray-600 mb-1">Ganancia neta anual proyectada</div>
            <div className="font-extrabold text-3xl text-[#1b6f5c]">{formatCurrency(gananciaAnual)}</div>
          </div>
        </div>
      </div>

      {/* División de ganancias */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-purple-600" />
          </div>
          <h2 className="font-bold text-lg text-gray-900">División de ganancias</h2>
        </div>

        <div className="space-y-3">
          {integrantes.map((integrante, index) => {
            const gananciaIntegrante = (gananciaNetaMensual * integrante.porcentaje) / 100;

            return (
              <div
                key={index}
                className="border-2 border-gray-100 rounded-xl p-4 hover:border-[#218a72] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#29a285] to-[#1b6f5c] text-white flex items-center justify-center font-bold">
                      {integrante.nombre.charAt(integrante.nombre.length - 1)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{integrante.nombre}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Percent size={12} />
                        {integrante.porcentaje}% de participación
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#218a72]/5 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Ganancia mensual</div>
                  <div className="font-extrabold text-xl text-[#1b6f5c]">
                    {formatCurrency(gananciaIntegrante)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
          <div className="text-xs text-gray-600 mb-1">Total distribuido mensual</div>
          <div className="font-extrabold text-xl text-gray-900">
            {formatCurrency(gananciaNetaMensual)}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-[#f5e663]/20 border-2 border-[#f5e663] rounded-2xl p-4">
        <p className="text-sm text-gray-700 text-center">
          <strong>Nota:</strong> Estas estadísticas son proyecciones basadas en datos simulados para fines demostrativos.
        </p>
      </div>
    </div>
  );
}
