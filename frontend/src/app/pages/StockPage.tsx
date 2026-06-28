import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Package,
  Plus,
  ChevronRight,
} from "lucide-react";
import { calcularEstado, type StockItem } from "../data/stockData";

export default function StockPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");

  useEffect(() => {
    const cargarStock = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/stock");

        if (!response.ok) {
          throw new Error("No se pudo obtener el stock");
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error cargando stock:", error);
      }
    };

    cargarStock();
  }, []);

  const categoriasUnicas = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoria))),
    [items]
  );

  const filteredItems = items.filter((item) => {
    const matchSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchFilter =
      filterCategoria === "todas" ||
      item.categoria === filterCategoria;

    return matchSearch && matchFilter;
  });

  const getEstadoStyle = (
    disponibles: number,
    total: number
  ) => {
    const e = calcularEstado(disponibles, total);

    if (e === "disponible")
      return {
        badge: "bg-green-100 text-green-800 border-green-300",
        bar: "bg-green-500",
      };

    if (e === "bajo")
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        bar: "bg-amber-500",
      };

    return {
      badge: "bg-red-100 text-red-800 border-red-300",
      bar: "bg-red-500",
    };
  };

  const estadoLabel = (
    disponibles: number,
    total: number
  ) => {
    const e = calcularEstado(disponibles, total);

    return e === "disponible"
      ? "Disponible"
      : e === "bajo"
      ? "Stock bajo"
      : "Agotado";
  };

  return (
    <div className="px-5 py-6 pb-10 relative">
      {/* KPIs */}
      <div
        className="grid grid-cols-3 gap-3 mb-5"
        role="list"
        aria-label="Resumen de stock"
      >
        <KpiCard
          value={
            items.filter(
              (i) =>
                calcularEstado(i.disponibles, i.total) ===
                "disponible"
            ).length
          }
          label="Disponibles"
          bg="bg-green-50"
          border="border-green-200"
          text="text-green-800"
          sub="text-green-700"
        />

        <KpiCard
          value={
            items.filter(
              (i) =>
                calcularEstado(i.disponibles, i.total) ===
                "bajo"
            ).length
          }
          label="Stock bajo"
          bg="bg-amber-50"
          border="border-amber-200"
          text="text-amber-800"
          sub="text-amber-700"
        />

        <KpiCard
          value={
            items.filter(
              (i) =>
                calcularEstado(i.disponibles, i.total) ===
                "agotado"
            ).length
          }
          label="Agotados"
          bg="bg-red-50"
          border="border-red-200"
          text="text-red-800"
          sub="text-red-700"
        />
      </div>

      {/* Botón agregar */}
      <button
        onClick={() => navigate("/app/stock/nuevo")}
        className="w-full flex items-center justify-center gap-2 py-3.5 mb-5 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
      >
        <Plus size={20} />
        <span>Agregar stock</span>
      </button>

      {/* Buscador */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Buscar equipo..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-[200px]">
          <Package
            size={18}
            className="text-gray-500 hidden sm:block"
          />

          <select
            value={filterCategoria}
            onChange={(e) =>
              setFilterCategoria(e.target.value)
            }
            className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
          >
            <option value="todas">
              Todas las categorías
            </option>

            {categoriasUnicas.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            No se encontraron equipos
          </div>
        ) : (
          filteredItems.map((item) => {
            const style = getEstadoStyle(
              item.disponibles,
              item.total
            );

            const pct =
              item.total > 0
                ? (item.disponibles / item.total) * 100
                : 0;

            return (
              <button
                key={item.id}
                onClick={() =>
                  navigate(`/app/stock/${item.id}`)
                }
                className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] hover:shadow-sm active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      {item.nombre}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.categoria}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${style.badge}`}
                    >
                      {estadoLabel(
                        item.disponibles,
                        item.total
                      )}
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${style.bar}`}
                      style={{
                        width: `${pct}%`,
                      }}
                    />
                  </div>

                  <div className="text-sm font-bold text-gray-700">
                    {item.disponibles}/{item.total}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function KpiCard({
  value,
  label,
  bg,
  border,
  text,
  sub,
}: {
  value: number;
  label: string;
  bg: string;
  border: string;
  text: string;
  sub: string;
}) {
  return (
    <div
      className={`${bg} border-2 ${border} rounded-2xl p-4 text-center`}
    >
      <div className={`text-2xl font-extrabold ${text}`}>
        {value}
      </div>

      <div
        className={`text-[10px] sm:text-xs font-bold ${sub} uppercase`}
      >
        {label}
      </div>
    </div>
  );
}