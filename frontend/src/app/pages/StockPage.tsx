import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Package, Plus, X, ChevronRight } from "lucide-react";
import {
  getStockItems,
  saveStockItems,
  addStockItem,
  calcularEstado,
  type StockItem,
} from "../data/stockData";

export default function StockPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", categoria: "", cantidad: 1 });

  useEffect(() => {
    setItems(getStockItems());
  }, []);

  const categoriasUnicas = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoria))),
    [items],
  );

  const filteredItems = items.filter((item) => {
    const matchSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterCategoria === "todas" || item.categoria === filterCategoria;
    return matchSearch && matchFilter;
  });

  const getEstadoStyle = (disponibles: number, total: number) => {
    const e = calcularEstado(disponibles, total);
    if (e === "disponible") return { badge: "bg-green-100 text-green-800 border-green-300", bar: "bg-green-500" };
    if (e === "bajo")       return { badge: "bg-amber-100 text-amber-800 border-amber-300", bar: "bg-amber-500" };
    return                         { badge: "bg-red-100 text-red-800 border-red-300",       bar: "bg-red-500" };
  };

  const estadoLabel = (disponibles: number, total: number) => {
    const e = calcularEstado(disponibles, total);
    return e === "disponible" ? "Disponible" : e === "bajo" ? "Stock bajo" : "Agotado";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || formData.cantidad <= 0) return;

    const existing = items.find(
      (i) => i.nombre.trim().toLowerCase() === formData.nombre.trim().toLowerCase(),
    );

    let updatedItems: StockItem[];
    if (existing) {
      updatedItems = items.map((i) =>
        i.id === existing.id
          ? { ...i, total: i.total + formData.cantidad, disponibles: i.disponibles + formData.cantidad }
          : i,
      );
      saveStockItems(updatedItems);
      setItems(updatedItems);
    } else {
      const newItem = addStockItem({
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim() || "Otros",
        total: formData.cantidad,
        disponibles: formData.cantidad,
      });
      setItems([...items, newItem]);
    }

    setIsModalOpen(false);
    setFormData({ nombre: "", categoria: "", cantidad: 1 });
  };

  return (
    <div className="px-5 py-6 pb-10 relative">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5" role="list" aria-label="Resumen de stock">
        <KpiCard value={items.filter((i) => calcularEstado(i.disponibles, i.total) === "disponible").length} label="Disponibles" bg="bg-green-50" border="border-green-200" text="text-green-800" sub="text-green-700" />
        <KpiCard value={items.filter((i) => calcularEstado(i.disponibles, i.total) === "bajo").length}       label="Stock bajo"  bg="bg-amber-50" border="border-amber-200" text="text-amber-800" sub="text-amber-700" />
        <KpiCard value={items.filter((i) => calcularEstado(i.disponibles, i.total) === "agotado").length}    label="Agotados"    bg="bg-red-50"   border="border-red-200"   text="text-red-800"   sub="text-red-700" />
      </div>

      {/* Botón principal */}
      <button
        onClick={() => { setFormData({ nombre: "", categoria: "", cantidad: 1 }); setIsModalOpen(true); }}
        className="w-full flex items-center justify-center gap-2 py-3.5 mb-5 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
        aria-label="Agregar stock"
      >
        <Plus size={20} aria-hidden="true" />
        <span>Agregar stock</span>
      </button>

      {/* Buscador y filtro */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar equipo..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar equipos"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 sm:max-w-[200px]">
          <Package size={18} className="text-gray-500 hidden sm:block" aria-hidden="true" />
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors text-sm"
            aria-label="Filtrar por categoría"
          >
            <option value="todas">Todas las categorías</option>
            {categoriasUnicas.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3" role="list" aria-label="Inventario de equipos">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200" role="listitem">
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
                className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] hover:shadow-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20"
                role="listitem"
                aria-label={`${item.nombre}, ${item.categoria}, ${estadoLabel(item.disponibles, item.total)}, ${item.disponibles} de ${item.total} unidades`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base mb-0.5">{item.nombre}</h3>
                    <p className="text-sm text-gray-500 font-medium">{item.categoria}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border-2 whitespace-nowrap ${style.badge}`}>
                      {estadoLabel(item.disponibles, item.total)}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${style.bar}`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.disponibles}
                      aria-valuemin={0}
                      aria-valuemax={item.total}
                      aria-label={`${item.disponibles} de ${item.total} unidades disponibles`}
                    />
                  </div>
                  <div className="text-sm font-extrabold text-gray-700 whitespace-nowrap">
                    {item.disponibles}/{item.total}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Modal agregar stock */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-stock-titulo"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 id="modal-stock-titulo" className="text-lg font-bold text-[#085041]">
                Ingresar / Modificar stock
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label htmlFor="nombre-stock" className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre del equipo
                </label>
                <input
                  id="nombre-stock"
                  type="text"
                  required
                  list="equipos-existentes"
                  value={formData.nombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    const existing = items.find((i) => i.nombre.toLowerCase() === val.toLowerCase());
                    setFormData((prev) => ({
                      ...prev,
                      nombre: existing ? existing.nombre : val,
                      categoria: existing ? existing.categoria : prev.categoria,
                    }));
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  placeholder="Ej: Micrófono Rode NTG3"
                />
                <datalist id="equipos-existentes">
                  {items.map((item) => <option key={item.id} value={item.nombre} />)}
                </datalist>
                <p className="text-xs text-gray-500 mt-1.5">
                  Si ingresás un nombre existente, se sumará al stock actual.
                </p>
              </div>

              <div>
                <label htmlFor="categoria-stock" className="block text-sm font-bold text-gray-700 mb-1.5">
                  Categoría
                </label>
                <input
                  id="categoria-stock"
                  type="text"
                  list="categorias-existentes"
                  value={formData.categoria}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  placeholder="Ej: Audio, Cámaras..."
                />
                <datalist id="categorias-existentes">
                  {categoriasUnicas.map((cat) => <option key={cat} value={cat} />)}
                </datalist>
              </div>

              <div>
                <label htmlFor="cantidad-stock" className="block text-sm font-bold text-gray-700 mb-1.5">
                  Cantidad a agregar
                </label>
                <input
                  id="cantidad-stock"
                  type="number"
                  min="1"
                  required
                  value={formData.cantidad}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cantidad: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#218a72] text-white rounded-xl font-bold hover:bg-[#196b58] transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ value, label, bg, border, text, sub }: { value: number; label: string; bg: string; border: string; text: string; sub: string }) {
  return (
    <div className={`${bg} border-2 ${border} rounded-2xl p-4 text-center`} aria-label={`${value} ${label}`}>
      <div className={`text-2xl font-extrabold ${text} mb-1`} aria-hidden="true">{value}</div>
      <div className={`text-[10px] sm:text-xs font-bold ${sub} uppercase tracking-wide`} aria-hidden="true">{label}</div>
    </div>
  );
}
