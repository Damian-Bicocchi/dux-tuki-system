import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, Package, Plus, ChevronRight, Tags, Boxes } from "lucide-react";
import { calcularEstado, type StockItem } from "../data/stockData";
import { CategoriasTab } from "../pages/administracion/tabs/CategoriasTab";
import { getAuthHeaders } from "../../../../backend/utils/putHeaders";

interface Categoria {
  id: number;
  nombre: string;
}

type TabStock = "inventario" | "categorias";

export default function StockPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabStock>("inventario");
  const [items, setItems] = useState<StockItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");

  // Función para cargar los datos autenticados
  const cargarDatos = useCallback(async () => {
    try {
      const [resStock, resCategorias] = await Promise.all([
        fetch("http://localhost:3001/api/stock", {
          headers: getAuthHeaders(), // Headers con token de autenticación
        }),
        fetch("http://localhost:3001/api/categorias", {
          headers: getAuthHeaders(), // Headers con token de autenticación
        }),
      ]);

      if (!resStock.ok || !resCategorias.ok) {
        throw new Error("No se pudieron obtener todos los datos");
      }

      const dataStock = await resStock.json();
      const dataCategorias = await resCategorias.json();

      setItems(dataStock);
      setCategorias(dataCategorias);
    } catch (error) {
      console.error("Error cargando los datos de la página de Stock:", error);
    }
  }, []);

  // Carga inicial y recarga cuando el usuario regresa a la pestaña "inventario"
  useEffect(() => {
    if (activeTab === "inventario") {
      cargarDatos();
    }
  }, [activeTab, cargarDatos]);

  const filteredItems = items.filter((item) => {
    const matchSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchFilter =
      filterCategoria === "todas" || item.categoria === filterCategoria;

    return matchSearch && matchFilter;
  });

  const getEstadoStyle = (disponibles: number, total: number) => {
    const e = calcularEstado(disponibles, total);
    if (e === "disponible") return { badge: "bg-green-100 text-green-800 border-green-300", bar: "bg-green-500" };
    if (e === "bajo") return { badge: "bg-amber-100 text-amber-800 border-amber-300", bar: "bg-amber-500" };
    return { badge: "bg-red-100 text-red-800 border-red-300", bar: "bg-red-500" };
  };

  const estadoLabel = (disponibles: number, total: number) => {
    const e = calcularEstado(disponibles, total);
    return e === "disponible" ? "Disponible" : e === "bajo" ? "Stock bajo" : "Agotado";
  };

  return (
    <div className="px-5 py-6 pb-10 min-h-screen bg-gradient-to-b from-white via-[#f7fbfa] to-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#218a72]/10 rounded-2xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Package size={28} className="text-[#218a72]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1b6f5c]">
            Gestión de stock
          </p>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
          Gestión de stock
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-2xl">
          Gestioná el inventario de equipos y administrá las categorías del sistema en un solo lugar.
        </p>
      </div>

      {/* Navegación por pestañas */}
      <div role="tablist" aria-label="Secciones de Stock" className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "inventario"}
            onClick={() => setActiveTab("inventario")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-t-xl transition-colors ${
              activeTab === "inventario"
                ? "bg-[#218a72] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Boxes size={18} />
            <span>Inventario de Equipos</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "categorias"}
            onClick={() => setActiveTab("categorias")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-t-xl transition-colors ${
              activeTab === "categorias"
                ? "bg-[#218a72] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Tags size={18} />
            <span>Categorías</span>
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "categorias" ? (
        <section role="tabpanel" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <CategoriasTab />
        </section>
      ) : (
        <section role="tabpanel">
          {/* Buscador e Input Select */}
          <div className="mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 sm:max-w-[300px]">
              <Package size={18} className="text-gray-500 hidden sm:block" />
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate("/app/stock/nuevo")}
            className="w-full flex items-center justify-center gap-2 py-3.5 mb-5 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
          >
            <Plus size={20} />
            <span>Agregar stock</span>
          </button>

          {/* Lista de Items */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                No se encontraron equipos
              </div>
            ) : (
              filteredItems.map((item) => {
                const style = getEstadoStyle(item.disponibles, item.total);
                const pct = item.total > 0 ? (item.disponibles / item.total) * 100 : 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/app/stock/${item.id}`)}
                    className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] hover:shadow-sm active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.nombre}</h3>
                        <p className="text-sm text-gray-500">{item.categoria}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${style.badge}`}>
                          {estadoLabel(item.disponibles, item.total)}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-full ${style.bar}`} style={{ width: `${pct}%` }} />
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
        </section>
      )}
    </div>
  );
}