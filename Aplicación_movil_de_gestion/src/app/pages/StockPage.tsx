import { useState, useMemo } from "react";
import { Search, Package, Plus, X } from "lucide-react";

interface Item {
  id: number;
  nombre: string;
  categoria: string;
  disponibles: number;
  total: number;
  estado: "disponible" | "bajo" | "agotado";
}

const INITIAL_ITEMS: Item[] = [
  {
    id: 1,
    nombre: "Cámara Sony A7 III",
    categoria: "Cámaras",
    disponibles: 2,
    total: 3,
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Cámara Canon 5D Mark IV",
    categoria: "Cámaras",
    disponibles: 1,
    total: 2,
    estado: "bajo",
  },
  {
    id: 3,
    nombre: "Micrófono Rode NTG3",
    categoria: "Audio",
    disponibles: 0,
    total: 2,
    estado: "agotado",
  },
  {
    id: 4,
    nombre: "Trípode Manfrotto",
    categoria: "Accesorios",
    disponibles: 4,
    total: 5,
    estado: "disponible",
  },
  {
    id: 5,
    nombre: "Kit de luces LED",
    categoria: "Iluminación",
    disponibles: 1,
    total: 3,
    estado: "bajo",
  },
  {
    id: 6,
    nombre: "Slider motorizado",
    categoria: "Accesorios",
    disponibles: 2,
    total: 2,
    estado: "disponible",
  },
];

export default function StockPage() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] =
    useState<string>("todas");

  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    cantidad: 1,
  });

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.categoria)));
  }, [items]);

  const categorias = ["todas", ...categoriasUnicas];

  const filteredItems = items.filter((item) => {
    const matchSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchFilter =
      filterCategoria === "todas" ||
      item.categoria === filterCategoria;
    return matchSearch && matchFilter;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800 border-green-300";
      case "bajo":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "agotado":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const calcularEstado = (
    disponibles: number,
    total: number,
  ): "disponible" | "bajo" | "agotado" => {
    if (disponibles === 0) return "agotado";
    if (disponibles <= total * 0.3) return "bajo";
    return "disponible";
  };

  const handleOpenModal = () => {
    setFormData({ nombre: "", categoria: "", cantidad: 1 });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || formData.cantidad <= 0)
      return;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.nombre.trim().toLowerCase() ===
          formData.nombre.trim().toLowerCase(),
      );

      if (existingItemIndex !== -1) {
        // Actualizar item existente
        const newItems = [...prevItems];
        const existingItem = newItems[existingItemIndex];

        const newTotal = existingItem.total + formData.cantidad;
        const newDisponibles =
          existingItem.disponibles + formData.cantidad;

        newItems[existingItemIndex] = {
          ...existingItem,
          total: newTotal,
          disponibles: newDisponibles,
          estado: calcularEstado(newDisponibles, newTotal),
        };
        return newItems;
      } else {
        // Crear nuevo item
        const newItem: Item = {
          id: Math.max(...prevItems.map((i) => i.id), 0) + 1,
          nombre: formData.nombre.trim(),
          categoria: formData.categoria.trim() || "Otros",
          total: formData.cantidad,
          disponibles: formData.cantidad,
          estado: calcularEstado(
            formData.cantidad,
            formData.cantidad,
          ),
        };
        return [...prevItems, newItem];
      }
    });

    setIsModalOpen(false);
  };

  return (
    <div className="px-5 py-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#085041]">
          Inventario
        </h2>
        <button
          onClick={handleOpenModal}
          className="bg-[#218a72] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#196b58] transition-colors shadow-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
          aria-label="Agregar o modificar stock"
        >
          <Plus size={20} />
          <span>Agregar Stock</span>
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-800 mb-1">
            {
              items.filter((i) => i.estado === "disponible")
                .length
            }
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">
            Disponibles
          </div>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-800 mb-1">
            {items.filter((i) => i.estado === "bajo").length}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide">
            Stock bajo
          </div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-red-800 mb-1">
            {items.filter((i) => i.estado === "agotado").length}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wide">
            Agotados
          </div>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
            aria-hidden="true"
          />
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
          <Package
            size={18}
            className="text-gray-500 hidden sm:block"
            aria-hidden="true"
          />
          <select
  value={filterCategoria}
  onChange={(e) => setFilterCategoria(e.target.value)}
  className="w-full sm:flex-1 px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors appearance-none text-sm"
  aria-label="Filtrar por categoría"
>
  {categorias.map((cat) => (
    <option key={cat} value={cat}>
      {cat === "todas" ? "Todas las categorías" : cat}
    </option>
  ))}
</select>
        </div>
      </div>

      {/* Lista de items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            No se encontraron equipos
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {item.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {item.categoria}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border-2 whitespace-nowrap ${getEstadoColor(item.estado)}`}
                >
                  {item.estado === "disponible"
                    ? "Disponible"
                    : item.estado === "bajo"
                      ? "Stock bajo"
                      : "Agotado"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.disponibles === 0
                        ? "bg-red-500"
                        : item.disponibles <= item.total * 0.3
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${item.total > 0 ? (item.disponibles / item.total) * 100 : 0}%`,
                    }}
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
            </article>
          ))
        )}
      </div>

      {/* Modal para Ingresar/Modificar Stock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#085041]">
                Ingresar/Modificar Stock
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 flex flex-col gap-4 overflow-y-auto"
            >
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-bold text-gray-700 mb-1.5"
                >
                  Nombre del equipo
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  list="equipos-existentes"
                  value={formData.nombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    const existing = items.find(
                      (i) =>
                        i.nombre.toLowerCase() ===
                        val.toLowerCase(),
                    );
                    if (existing) {
                      setFormData((prev) => ({
                        ...prev,
                        nombre: existing.nombre,
                        categoria: existing.categoria,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        nombre: val,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  placeholder="Ej: Micrófono Rode NTG3"
                />
                <datalist id="equipos-existentes">
                  {items.map((item) => (
                    <option key={item.id} value={item.nombre} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1.5">
                  Si ingresas un nombre existente, se sumará al
                  stock actual en lugar de crear un duplicado.
                </p>
              </div>

              <div>
                <label
                  htmlFor="categoria"
                  className="block text-sm font-bold text-gray-700 mb-1.5"
                >
                  Categoría
                </label>
                <input
                  id="categoria"
                  type="text"
                  list="categorias-existentes"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoria: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  placeholder="Ej: Audio, Cámaras..."
                />
                <datalist id="categorias-existentes">
                  {categoriasUnicas.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="cantidad"
                  className="block text-sm font-bold text-gray-700 mb-1.5"
                >
                  Cantidad a agregar
                </label>
                <input
  id="cantidad"
  type="number"
  min="1"
  required
  value={formData.cantidad}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      cantidad: parseInt(e.target.value) || 0,
    }))
  }
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
/>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#218a72] text-white font-bold rounded-xl hover:bg-[#196b58] transition-colors focus:ring-4 focus:ring-[#218a72]/30"
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