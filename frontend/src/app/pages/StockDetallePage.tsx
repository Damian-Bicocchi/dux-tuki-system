import { useState, useEffect, useId } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  Tag,
  Hash,
  Save,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
} from "lucide-react";
import {
  getStockItemById,
  updateStockItem,
  alquileresPorItem,
  calcularEstado,
  type StockItem,
  type AlquilerDeEquipo,
  type EstadoAlquilerStock,
} from "../data/stockData";
import { SuccessModal } from "../components/SuccessModal";

type SortDir = "asc" | "desc";
type FiltroEstado = "todos" | EstadoAlquilerStock;

const CATEGORIAS_MOCK = [
  "Audio",
  "Cámaras",
  "Iluminación",
  "Trípodes",
  "Accesorios",
  "Otros",
];

const ESTADO_META: Record<
  EstadoAlquilerStock,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ElementType;
  }
> = {
  activo: {
    label: "Activo",
    bg: "bg-green-100",
    text: "text-green-900",
    icon: Clock,
  },
  vencido: {
    label: "Vencido",
    bg: "bg-red-100",
    text: "text-red-900",
    icon: AlertCircle,
  },
  finalizado: {
    label: "Finalizado",
    bg: "bg-gray-100",
    text: "text-gray-900",
    icon: CheckCircle2,
  },
};

const ITEMS_POR_PAGINA = 3;

function formatFecha(fecha: string) {
  return fecha.split("-").reverse().join("/");
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

export default function StockDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // IDs estables para accesibilidad
  const ayudaDisponiblesId = useId();
  const barraProgresoId = useId();

  const [item, setItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    disponibles: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados de control para el historial de alquileres
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const found = getStockItemById(Number(id));
    if (!found) {
      navigate("/app/stock", { replace: true });
      return;
    }
    setItem(found);
    setForm({
      nombre: found.nombre,
      categoria: found.categoria,
      disponibles: found.disponibles,
    });
  }, [id, navigate]);

  useEffect(() => {
    setPagina(1);
  }, [filtroEstado]);

  if (!item) return null;

  // Procesamiento del historial de alquileres
  const alquileresBase: AlquilerDeEquipo[] =
    alquileresPorItem[item.id] ?? [];

  const alquileresFiltrados = alquileresBase.filter((alq) => {
    if (filtroEstado === "todos") return true;
    return alq.estado === filtroEstado;
  });

  const alquileresOrdenados = alquileresFiltrados
    .slice()
    .sort((a, b) => {
      const cmp = a.fechaFin.localeCompare(b.fechaFin);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPaginas =
    Math.ceil(alquileresOrdenados.length / ITEMS_POR_PAGINA) ||
    1;
  const inicioIdx = (pagina - 1) * ITEMS_POR_PAGINA;
  const alquileresPaginados = alquileresOrdenados.slice(
    inicioIdx,
    inicioIdx + ITEMS_POR_PAGINA,
  );

  // Lógica de cálculo de stock
  const cantidadAlquilados = Math.max(
    0,
    item.total - item.disponibles,
  );
  const nuevoTotalCalculado =
    form.disponibles + cantidadAlquilados;
  const estado = calcularEstado(
    form.disponibles,
    nuevoTotalCalculado,
  );

  const estadoStyle =
    estado === "disponible"
      ? "bg-green-100 text-green-900 border-green-400"
      : estado === "bajo"
        ? "bg-amber-100 text-amber-950 border-amber-400"
        : "bg-red-100 text-red-900 border-red-400";
  const estadoLabel =
    estado === "disponible"
      ? "Disponible"
      : estado === "bajo"
        ? "Stock bajo"
        : "Agotado";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    const updated: StockItem = {
      ...item!,
      nombre: form.nombre.trim(),
      categoria: form.categoria || "Otros",
      disponibles: form.disponibles,
      total: nuevoTotalCalculado,
    };

    updateStockItem(updated);
    setItem(updated);
    setShowSuccess(true);
  }

  return (
    <>
    <SuccessModal
      isOpen={showSuccess}
      title="¡Cambios guardados!"
      message={`Los datos de "${form.nombre || item.nombre}" fueron actualizados correctamente.`}
      onClose={() => setShowSuccess(false)}
    />
    <div className="pb-10 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-[#1b6f5c] via-[#165a4b] to-[#0f3d33] px-5 pt-4 pb-6 text-white shadow-md">
        <button
          onClick={() => navigate("/app/stock")}
          className="flex items-center gap-1.5 text-white/90 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-2 py-1 transition-colors bg-white/10"
          aria-label="Volver a la página anterior: Lista general de stock"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="text-sm font-semibold">
            Volver a Stock
          </span>
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Package size={26} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight truncate">
              {item.nombre}
            </h1>
            <p className="text-white/80 text-sm mt-0.5 font-medium">
              Categoría: {item.categoria} ·{" "}
              {alquileresBase.length} alquiler
              {alquileresBase.length !== 1 ? "es" : ""} en total
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg md:max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Formulario de edición */}
        <section
          aria-labelledby="editar-titulo"
          className="w-full"
        >
          <h2
            id="editar-titulo"
            className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3"
          >
            Modificar especificaciones del equipo
          </h2>
          <form
            onSubmit={handleSave}
            className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm"
          >
            {/* Nombre */}
            <div>
              <label
                htmlFor="edit-nombre"
                className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
              >
                <Package
                  size={15}
                  className="text-[#165a4b]"
                  aria-hidden="true"
                />
                Nombre del equipo
              </label>
              <input
                id="edit-nombre"
                type="text"
                required
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    nombre: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#165a4b] transition-colors text-sm text-gray-900 font-medium"
              />
            </div>

            {/* Categoría */}
            <div>
              <label
                htmlFor="edit-categoria"
                className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
              >
                <Tag
                  size={15}
                  className="text-[#165a4b]"
                  aria-hidden="true"
                />
                Categoría
              </label>
              <select
                id="edit-categoria"
                value={form.categoria}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    categoria: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#165a4b] transition-colors text-sm text-gray-900 font-medium cursor-pointer"
              >
                {CATEGORIAS_MOCK.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad Disponible */}
            <div>
              <label
                htmlFor="edit-disponibles"
                className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
              >
                <Hash
                  size={15}
                  className="text-[#165a4b]"
                  aria-hidden="true"
                />
                Cantidad disponible en depósito
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="edit-disponibles"
                  type="number"
                  min="0"
                  required
                  aria-describedby={ayudaDisponiblesId}
                  value={form.disponibles}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      disponibles: Math.max(
                        0,
                        parseInt(e.target.value) || 0,
                      ),
                    }))
                  }
                  className="w-32 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#165a4b] transition-colors text-sm text-gray-900 font-medium"
                />
                <span
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${estadoStyle}`}
                  role="status"
                >
                  {estadoLabel}
                </span>
              </div>
              <p
                id={ayudaDisponiblesId}
                className="text-xs text-gray-500 mt-2 font-medium"
              >
                * Hay{" "}
                <span className="font-bold text-gray-700">
                  {cantidadAlquilados}
                </span>{" "}
                unidad{cantidadAlquilados !== 1 ? "es" : ""}{" "}
                retenida{cantidadAlquilados !== 1 ? "as" : ""}{" "}
                en alquileres activos. Modificar este valor
                recalculará el stock total.
              </p>
            </div>

            {/* Barra Visual Informativa */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  id={barraProgresoId}
                  className="text-xs font-bold text-gray-600"
                >
                  Proporción de Stock Real
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {form.disponibles} / {nuevoTotalCalculado}{" "}
                  totales
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${estado === "disponible" ? "bg-green-600" : estado === "bajo" ? "bg-amber-600" : "bg-red-600"}`}
                  style={{
                    width: `${nuevoTotalCalculado > 0 ? (form.disponibles / nuevoTotalCalculado) * 100 : 0}%`,
                  }}
                  role="progressbar"
                  aria-labelledby={barraProgresoId}
                  aria-valuenow={form.disponibles}
                  aria-valuemin={0}
                  aria-valuemax={nuevoTotalCalculado}
                  aria-valuetext={`${form.disponibles} unidades disponibles de un stock recalculado de ${nuevoTotalCalculado}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#165a4b] hover:bg-[#0f3d33] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/40"
            >
              <Save size={18} aria-hidden="true" />
              <span>Guardar cambios</span>
            </button>
          </form>
        </section>

        {/* Alquileres relacionados */}
        <section
          aria-labelledby="alquileres-titulo"
          className="w-full space-y-4"
        >
          <h2
            id="alquileres-titulo"
            className="text-xs font-bold text-gray-700 uppercase tracking-wider self-center"
          >
            Historial de Alquileres (
            {alquileresFiltrados.length})
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Controles de Filtrado y Ordenamiento Grandes (Altura h-14 para móviles) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Selector de Filtrado por Estado Centrado */}
              <div className="relative flex items-center bg-white border-2 border-gray-300 rounded-xl h-14 shadow-sm flex-1 sm:w-56 focus-within:ring-4 focus-within:ring-[#218a72]/20 focus-within:border-[#165a4b] transition-all">
                <div
                  className="absolute left-4 pointer-events-none text-gray-500"
                  aria-hidden="true"
                >
                  <Filter size={18} />
                </div>

                <label
                  htmlFor="filtro-estado"
                  className="sr-only"
                >
                  Filtrar historial por estado de alquiler
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  aria-controls="contenedor-alquileres-lista"
                  onChange={(e) =>
                    setFiltroEstado(
                      e.target.value as FiltroEstado,
                    )
                  }
                  className="w-full h-full bg-transparent text-sm font-bold text-gray-800 text-center text-last-center appearance-none pl-10 pr-10 cursor-pointer focus:outline-none"
                >
                  <option value="todos">
                    Todos los estados
                  </option>
                  <option value="activo">Solo Activos</option>
                  <option value="vencido">Solo Vencidos</option>
                  <option value="finalizado">
                    Solo Finalizados
                  </option>
                </select>

                <div
                  className="absolute right-4 pointer-events-none text-gray-500"
                  aria-hidden="true"
                >
                  <ChevronRight
                    size={16}
                    className="rotate-90"
                  />
                </div>
              </div>

              {/* Botón de Ordenamiento Robusto por Fecha con etiquetas narrativas */}
              {alquileresFiltrados.length > 0 && (
                <button
                  onClick={() =>
                    setSortDir((d) =>
                      d === "asc" ? "desc" : "asc",
                    )
                  }
                  aria-controls="contenedor-alquileres-lista"
                  className="flex items-center justify-center gap-2 h-14 px-5 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-800 bg-white hover:border-[#165a4b] hover:text-[#165a4b] hover:bg-gray-50 active:scale-[0.97] shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#165a4b] flex-1 sm:flex-initial whitespace-nowrap"
                  aria-label={`Ordenar historial por fecha de finalización. Orden actual: ${sortDir === "asc" ? "antiguos primero" : "recientes primero"}`}
                >
                  {sortDir === "asc" ? (
                    <>
                      <ArrowUp
                        size={18}
                        className="text-[#165a4b]"
                        aria-hidden="true"
                      />
                      <span>Fecha fin (Ascendente)</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown
                        size={18}
                        className="text-[#165a4b]"
                        aria-hidden="true"
                      />
                      <span>Fecha fin (Descendente)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Listado de alquileres con Región Viva */}
          <div
            id="contenedor-alquileres-lista"
            role="region"
            aria-live="polite"
            aria-atomic="true"
            className="focus:outline-none"
          >
            {alquileresPaginados.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm font-semibold shadow-sm">
                No hay alquileres registrados que coincidan con
                el filtro seleccionado.
              </div>
            ) : (
              <div
                className="space-y-2.5"
                role="list"
                aria-label={`Lista de alquileres filtrados. Viendo página ${pagina} de ${totalPaginas}`}
              >
                {alquileresPaginados.map((alq) => {
                  const meta = ESTADO_META[alq.estado];
                  const StatusIcon = meta.icon;
                  return (
                    <button
                      key={alq.id}
                      onClick={() =>
                        navigate("/app/alquileres")
                      }
                      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#165a4b] hover:shadow-md active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20"
                      role="listitem"
                      aria-label={`Alquiler número ${alq.id} del cliente ${alq.cliente}. Estado: ${meta.label}. Periodo del ${formatFecha(alq.fechaInicio)} al ${formatFecha(alq.fechaFin)}. Costo total: ${formatMonto(alq.precio)}. Presione para ver detalles del alquiler.`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div
                          className="flex-1 min-w-0"
                          aria-hidden="true"
                        >
                          <p className="font-bold text-gray-990 text-sm truncate">
                            {alq.cliente}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            ID: #{alq.id}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-1.5 flex-shrink-0"
                          aria-hidden="true"
                        >
                          <span
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.text}`}
                          >
                            <StatusIcon size={11} />
                            {meta.label}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-gray-400"
                          />
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-2 mt-2"
                        aria-hidden="true"
                      >
                        <span>
                          <span className="font-bold text-gray-800">
                            Inicio:
                          </span>{" "}
                          {formatFecha(alq.fechaInicio)}
                          <span className="mx-2 text-gray-300">
                            |
                          </span>
                          <span className="font-bold text-gray-800">
                            Fin:
                          </span>{" "}
                          {formatFecha(alq.fechaFin)}
                        </span>
                        <span className="font-extrabold text-gray-900 text-sm">
                          {formatMonto(alq.precio)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selector de Paginación Robustecido (h-12 para las flechas) */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2 shadow-sm mt-4">
              <button
                type="button"
                disabled={pagina === 1}
                onClick={() =>
                  setPagina((p) => Math.max(1, p - 1))
                }
                aria-controls="contenedor-alquileres-lista"
                className="p-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:border-[#165a4b] hover:text-[#165a4b] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Ir a la página anterior de alquileres"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>

              <span
                className="text-sm font-bold text-gray-700"
                aria-live="polite"
                aria-atomic="true"
              >
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={pagina === totalPaginas}
                onClick={() =>
                  setPagina((p) =>
                    Math.min(totalPaginas, p + 1),
                  )
                }
                aria-controls="contenedor-alquileres-lista"
                className="p-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:border-[#165a4b] hover:text-[#165a4b] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Ir a la página siguiente de alquileres"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
}