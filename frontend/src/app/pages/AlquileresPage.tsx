import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Search, Filter, ChevronRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAlquileres, formatFecha, type Alquiler } from "../data/alquileresData";

const ESTADO_META: Record<
  Alquiler["estado"],
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  activo: {
    label: "Activo",
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    icon: Clock,
  },
  vencido: {
    label: "Vencido",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: AlertCircle,
  },
  finalizado: {
    label: "Finalizado",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    icon: CheckCircle2,
  },
};

export default function AlquileresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const alquileres = getAlquileres();

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && ["activo", "vencido", "finalizado"].includes(filterParam)) {
      setFilterEstado(filterParam);
    }
  }, [searchParams]);

  const handleFilterChange = (nuevoFiltro: string) => {
    setFilterEstado(nuevoFiltro);
    if (nuevoFiltro === "todos") {
      setSearchParams({});
    } else {
      setSearchParams({ filter: nuevoFiltro });
    }
  };

  const filteredAlquileres = alquileres.filter((alq) => {
    const matchSearch =
      alq.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alq.equipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterEstado === "todos" || alq.estado === filterEstado;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-5 py-6">
      {/* Buscador y filtros */}
      <div className="mb-6 space-y-3">
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
            placeholder="Buscar por cliente o equipo..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar alquileres por cliente o equipo"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
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

      {/* Lista de alquileres */}
      <ul className="space-y-3 mb-24" role="list" aria-label="Lista de alquileres">
        {filteredAlquileres.length === 0 ? (
          <li className="text-center py-12 text-gray-500 font-medium">
            No se encontraron alquileres con los filtros aplicados.
          </li>
        ) : (
          filteredAlquileres.map((alq) => {
            const meta = ESTADO_META[alq.estado];
            const EstadoIcon = meta.icon;
            return (
              <li key={alq.id} role="listitem">
                <button
                  type="button"
                  onClick={() => navigate(`/app/alquileres/${alq.id}`)}
                  className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72]/50 hover:shadow-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
                  aria-label={`Ver detalle del alquiler de ${alq.cliente} — ${alq.equipo}, estado: ${meta.label}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate">
                        {alq.cliente}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{alq.equipo}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        <EstadoIcon size={11} aria-hidden="true" />
                        {meta.label}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-500">
                      <span className="font-semibold text-gray-700">
                        {formatFecha(alq.fechaInicio)}
                      </span>
                      <span className="mx-1.5 text-gray-400">→</span>
                      <span className="font-semibold text-gray-700">
                        {formatFecha(alq.fechaFin)}
                      </span>
                    </p>
                    <p className="font-bold text-gray-900">
                      ${alq.precio.toLocaleString("es-AR")}
                      <span className="text-gray-400 font-normal">/día</span>
                    </p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Botón flotante */}
      <button
        onClick={() => navigate("/app/nuevo-alquiler")}
        className="fixed bottom-8 right-6 bg-[#f5e663] text-[#1b6f5c] rounded-full shadow-xl flex items-center justify-center gap-2 px-6 py-4 hover:scale-105 focus:scale-105 active:scale-95 transition-transform z-30 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#f5e663]/50"
        aria-label="Crear nuevo alquiler"
      >
        <Plus size={24} strokeWidth={2.5} aria-hidden="true" />
        <span className="font-bold text-base">Nuevo alquiler</span>
      </button>
    </div>
  );
}
