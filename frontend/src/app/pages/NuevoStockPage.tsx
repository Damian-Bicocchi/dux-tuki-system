import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Package,
  Tag,
  Hash,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { SuccessModal } from "../components/SuccessModal";
import { FailureModal } from "../components/FailureModal"; // Importamos tu nuevo componente

interface Categoria {
  id: number;
  nombre: string;
}

interface StockItem {
  id: number;
  nombre: string;
  categoria: string;
  total: number;
  disponibles: number;
}

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

type DuplicadoStatus =
  | { tipo: "exacto"; item: StockItem }
  | { tipo: "similares"; nombres: string[] }
  | null;

export default function NuevoStockPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [errors, setErrors] = useState<{ nombre?: string; cantidad?: string }>({});

  // Estados para el comportamiento del Combobox (Autocomplete)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados para el manejo de la API de categorías y artículos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(false);
  
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);

  // Estados para el control de Modales de Éxito y Error
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState({ title: "", message: "" });

  const [showFailure, setShowFailure] = useState(false);
  const [failureMsg, setFailureMsg] = useState({ title: "", message: "" });

  // Función para consumir las categorías del backend
  const cargarCategoriasAPI = async () => {
    try {
      setCargandoCategorias(true);
      setErrorCategorias(false);
      const response = await fetch("http://localhost:3001/api/categorias");
      if (!response.ok) throw new Error("Error al obtener las categorías");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setErrorCategorias(true);
    } finally {
      setCargandoCategorias(false);
    }
  };

  // Función para cargar los artículos actuales y calcular duplicados en tiempo real
  const cargarArticulosAPI = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/stock");
      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error("Error cargando artículos de stock:", error);
    }
  };

  // Cargar datos reales desde el backend al montar el componente
  useEffect(() => {
    cargarCategoriasAPI();
    cargarArticulosAPI();
  }, []);

  // Filtrar las opciones del autocompletado según lo que escribe el usuario
  const opcionesFiltradas = useMemo(() => {
    const query = normalizar(nombre);
    if (!query) return stockItems.map((i) => i.nombre);
    return stockItems
      .filter((item) => normalizar(item.nombre).includes(query))
      .map((item) => item.nombre);
  }, [nombre, stockItems]);

  // Cerrar el dropdown si el usuario hace click afuera del combobox
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detectar duplicados exactos o similares en vivo
  const duplicado: DuplicadoStatus = useMemo(() => {
    if (!nombre.trim()) return null;
    const query = normalizar(nombre);

    const exacto = stockItems.find(
      (i) => normalizar(i.nombre) === query
    );
    if (exacto) return { tipo: "exacto", item: exacto };

    const similares = stockItems
      .filter((i) => {
        const n = normalizar(i.nombre);
        return (
          n.includes(query) ||
          query.includes(n) ||
          n.split(" ").some((w) => w.length > 3 && query.includes(w))
        );
      })
      .map((i) => i.nombre);

    if (similares.length > 0) return { tipo: "similares", nombres: similares };
    return null;
  }, [nombre, stockItems]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isDropdownOpen && opcionesFiltradas.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsDropdownOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % opcionesFiltradas.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + opcionesFiltradas.length) % opcionesFiltradas.length);
    } else if (e.key === "Enter") {
      if (isDropdownOpen && activeIndex >= 0 && opcionesFiltradas[activeIndex]) {
        e.preventDefault();
        setNombre(opcionesFiltradas[activeIndex]);
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  }

  function validate() {
    const errs: typeof errors = {};
    if (!nombre.trim()) errs.nombre = "El nombre del equipo es obligatorio.";
    if (cantidad < 1) errs.cantidad = "La cantidad debe ser al menos 1.";
    return errs;
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (enviandoFormulario) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setEnviandoFormulario(true);

      const response = await fetch("http://localhost:3001/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          categoria: categoria || "Otros",
          cantidad: cantidad,
        }),
      });

      // 🚨 CONTROL DE PARSEO SEGURO:
      // Verificamos si el backend respondió con un Content-Type de tipo JSON
      const contentType = response.headers.get("content-type");
      let resultado: any = {};
      
      if (contentType && contentType.includes("application/json")) {
        resultado = await response.json();
      } else {
        // Si no es JSON (ej: un error HTML de Express 404/500 plano), lo leemos como texto alternativo
        const textoError = await response.text();
        console.error("El backend no devolvió JSON. Respuesta cruda del servidor:", textoError);
        throw new Error(`Servidor devolvió formato inesperado (Código ${response.status})`);
      }

      if (!response.ok) {
        if (resultado.errors) {
          setErrors(resultado.errors);
        } else {
          setFailureMsg({
            title: "No se pudo guardar",
            message: resultado.message || "Ocurrió un error inesperado al procesar el stock.",
          });
          setShowFailure(true);
        }
        return;
      }

      setSuccessMsg({
        title: response.status === 200 ? "Stock actualizado" : "¡Equipo agregado!",
        message: resultado.message,
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error al enviar el formulario:", error);
      setFailureMsg({
        title: "Error en la solicitud",
        message: error.message || "No se pudo establecer comunicación con el servidor backend. Verificá que el backend esté encendido.",
      });
      setShowFailure(true);
    } finally {
      setEnviandoFormulario(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none focus:ring-4 ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-[#218a72] focus:ring-[#218a72]/20"
    }`;

  return (
    <div className="pb-12 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-[#1b6f5c] via-[#165a4b] to-[#0f3d33] px-5 pt-4 pb-8 text-white shadow-md">
        <button
          type="button"
          onClick={() => navigate("/app/stock")}
          className="flex items-center gap-1.5 text-white/90 hover:text-white mb-5 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-2 py-1 transition-colors bg-white/10"
          aria-label="Volver a la lista de stock"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="text-sm font-semibold">Stock</span>
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Package size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight">Agregar equipo</h1>
            <p className="text-white/75 text-sm mt-0.5">
              Registrá un equipo nuevo o sumá unidades a uno existente.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-lg mx-auto">
        {/* Modal de Éxito */}
        <SuccessModal
          isOpen={showSuccess}
          title={successMsg.title}
          message={successMsg.message}
          onClose={() => navigate("/app/stock")}
        />

        {/* 🚀 Modal de Fallo integrado */}
        <FailureModal
          isOpen={showFailure}
          title={failureMsg.title}
          message={failureMsg.message}
          actionLabel="Entendido"
          onClose={() => setShowFailure(false)}
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulario para agregar equipo al stock"
          className="space-y-5"
        >
          {/* NOMBRE (COMBOBOX / AUTOCOMPLETE) */}
          <div ref={dropdownRef} className="relative">
            <label
              htmlFor="nombre"
              className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
            >
              <Package size={15} className="text-[#218a72]" aria-hidden="true" />
              Nombre del equipo
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            
            <input
              id="nombre"
              type="text"
              role="combobox"
              aria-expanded={isDropdownOpen}
              aria-autocomplete="list"
              aria-controls="nombre-listbox"
              aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
              value={nombre}
              disabled={enviandoFormulario}
              onChange={(e) => {
                setNombre(e.target.value);
                setIsDropdownOpen(true);
                setActiveIndex(-1);
                if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí para buscar o agregar equipo..."
              aria-required="true"
              aria-invalid={!!errors.nombre}
              aria-describedby={
                errors.nombre
                  ? "error-nombre"
                  : duplicado
                  ? "aviso-duplicado"
                  : undefined
              }
              className={inputClass(!!errors.nombre)}
            />

            {isDropdownOpen && opcionesFiltradas.length > 0 && (
              <ul
                id="nombre-listbox"
                role="listbox"
                aria-label="Sugerencias de equipos existentes"
                className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl max-h-60 overflow-y-auto shadow-xl focus:outline-none py-1"
              >
                {opcionesFiltradas.map((opcion, index) => (
                  <li
                    key={opcion}
                    id={`option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setNombre(opcion);
                      setIsDropdownOpen(false);
                      setActiveIndex(-1);
                    }}
                    className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                      index === activeIndex
                        ? "bg-[#218a72] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opcion}
                  </li>
                ))}
              </ul>
            )}

            {errors.nombre && (
              <p id="error-nombre" role="alert" aria-live="assertive" className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} aria-hidden="true" /> {errors.nombre}
              </p>
            )}

            {/* Alerta de duplicado exacto */}
            {!errors.nombre && duplicado?.tipo === "exacto" && (
              <div
                id="aviso-duplicado"
                role="status"
                aria-live="polite"
                className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800"
              >
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <div className="text-xs font-medium leading-relaxed">
                  <span className="font-bold">Este equipo ya existe.</span> Al guardar, se
                  sumarán las unidades al stock actual ({duplicado.item.disponibles}/
                  {duplicado.item.total} disponibles).
                </div>
              </div>
            )}

            {/* Alerta de similares */}
            {!errors.nombre && duplicado?.tipo === "similares" && (
              <div
                id="aviso-duplicado"
                role="status"
                aria-live="polite"
                className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800"
              >
                <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" aria-hidden="true" />
                <div className="text-xs font-medium leading-relaxed">
                  <span className="font-bold">Equipos similares encontrados:</span>{" "}
                  {duplicado.nombres.join(", ")}. Verificá que no sea el mismo antes de continuar.
                </div>
              </div>
            )}
          </div>

          {/* CATEGORÍA */}
          <div>
            <label
              htmlFor="categoria"
              className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
            >
              <Tag size={15} className="text-[#218a72]" aria-hidden="true" />
              Categoría
              {cargandoCategorias && (
                <span className="flex items-center gap-1 text-xs font-normal text-gray-400 ml-1">
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                  Cargando…
                </span>
              )}
            </label>

            {errorCategorias ? (
              <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={15} aria-hidden="true" />
                No se pudieron cargar las categorías.{" "}
                <button
                  type="button"
                  onClick={cargarCategoriasAPI}
                  className="underline font-semibold hover:text-red-900 focus:outline-none focus:ring-1 focus:ring-red-400 rounded cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={cargandoCategorias || enviandoFormulario}
                aria-busy={cargandoCategorias}
                aria-label="Categoría del equipo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer"
              >
                <option value="">Seleccioná una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* CANTIDAD */}
          <div>
            <label
              htmlFor="cantidad"
              className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
            >
              <Hash size={15} className="text-[#218a72]" aria-hidden="true" />
              {duplicado?.tipo === "exacto" ? "Unidades a sumar" : "Cantidad inicial"}
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              disabled={enviandoFormulario}
              onChange={(e) => {
                setCantidad(parseInt(e.target.value) || 0);
                if (errors.cantidad) setErrors((p) => ({ ...p, cantidad: undefined }));
              }}
              aria-required="true"
              aria-invalid={!!errors.cantidad}
              aria-describedby={errors.cantidad ? "error-cantidad" : undefined}
              className={`${inputClass(!!errors.cantidad)} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            />
            {errors.cantidad && (
              <p id="error-cantidad" role="alert" aria-live="assertive" className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} aria-hidden="true" /> {errors.cantidad}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={enviandoFormulario}
              className="w-full py-4 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviandoFormulario && <Loader2 size={18} className="animate-spin" />}
              {duplicado?.tipo === "exacto" ? "Sumar unidades" : "Registrar equipo"}
            </button>
            <button
              type="button"
              disabled={enviandoFormulario}
              onClick={() => navigate("/app/stock")}
              className="w-full py-4 border-2 border-gray-200 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}