import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Package,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
type EstadoDetalle = "activo" | "vencido" | "finalizado";

interface AlquilerItemApi {
  id: number;
  articulo_nombre: string;
  cantidad: number;
  precio_unitario_dia: number;
}

interface AlquilerApi {
  id: number;
  cliente_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "activo" | "devuelto" | "cancelado";
  deposito_garantia: number;
  notas?: string;
  items: AlquilerItemApi[];
}

const API_BASE_URL = "http://localhost:3001/api";

function calcularDias(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T00:00:00`);
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}

function mapEstadoDetalle(estado: AlquilerApi["estado"], fechaFin: string): EstadoDetalle {
  if (estado === "devuelto" || estado === "cancelado") return "finalizado";
  const hoy = new Date().toISOString().slice(0, 10);
  if (estado === "activo" && fechaFin < hoy) return "vencido";
  return "activo";
}

const ESTADO_META: Record<
  EstadoDetalle,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType; desc: string }
> = {
  activo: {
    label: "Activo / En Curso",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: Clock,
    desc: "El cliente posee el equipo actualmente y el tiempo está corriendo.",
  },
  vencido: {
    label: "Plazo Vencido",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: AlertCircle,
    desc: "La fecha estipulada de devolución ha expirado. Requiere acción inmediata.",
  },
  finalizado: {
    label: "Finalizado / Entregado",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: CheckCircle2,
    desc: "El proceso de alquiler ha concluido y el inventario fue procesado.",
  },
};

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
      {/* Icono decorativo oculto para lectores de pantalla */}
      <div className="w-8 h-8 rounded-lg bg-[#218a72]/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
        <Icon size={16} className="text-[#218a72]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? "text-[#165a4b]" : "text-gray-900"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AlquilerDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alquiler, setAlquiler] = useState<AlquilerApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados del Formulario de Entrega ---
  const [entregaParcial, setEntregaParcial] = useState(false);
  const [detalleParcial, setDetalleParcial] = useState("");
  const [tieneDanos, setTieneDanos] = useState(false);
  const [cobroDanos, setCobroDanos] = useState(0);
  const [detalleDanos, setDetalleDanos] = useState("");
  const [fueraTermino, setFueraTermino] = useState(false);
  const [cobroPenalizacion, setCobroPenalizacion] = useState(0);
  const [notasEntrega, setNotasEntrega] = useState("");
  const [processingCierre, setProcessingCierre] = useState(false);
  const [cantidadesDevueltas, setCantidadesDevueltas] = useState<Record<number, number>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadAlquiler() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/alquileres/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el detalle del alquiler");
        }
        const data = (await response.json()) as AlquilerApi;
        if (isMounted) {
          setAlquiler(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error inesperado");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAlquiler();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const itemsAlquilados = useMemo(
    () =>
      (alquiler?.items || []).map((item) => ({
        id: item.id,
        nombre: item.articulo_nombre,
        cantidad: item.cantidad,
        precio: item.precio_unitario_dia,
      })),
    [alquiler],
  );

  useEffect(() => {
    if (!itemsAlquilados.length) return;
    const initialCantidades = itemsAlquilados.reduce<Record<number, number>>((acc, item) => {
      acc[item.id] = item.cantidad;
      return acc;
    }, {});
    setCantidadesDevueltas(initialCantidades);
  }, [itemsAlquilados]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 text-lg font-medium mb-4">Cargando alquiler...</p>
      </div>
    );
  }

  if (!alquiler || error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 text-lg font-medium mb-4">{error || "Alquiler no encontrado."}</p>
        <button
          onClick={() => navigate("/app/alquileres")}
          className="px-5 py-3 bg-[#218a72] text-white rounded-xl font-bold transition-transform active:scale-95"
        >
          Volver a alquileres
        </button>
      </div>
    );
  }

  const estadoVista = mapEstadoDetalle(alquiler.estado, alquiler.fecha_fin);
  const meta = ESTADO_META[estadoVista];
  const EstadoIcon = meta.icon;
  const dias = calcularDias(alquiler.fecha_inicio, alquiler.fecha_fin);
  
  // Cálculos económicos
  const subtotal = itemsAlquilados.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad * dias), 0);
  const totalOriginal = subtotal + Number(alquiler.deposito_garantia || 0);
  const cargosAdicionales = (tieneDanos ? cobroDanos : 0) + (fueraTermino ? cobroPenalizacion : 0);
  const balanceFinal = totalOriginal + cargosAdicionales;
  const totalPendiente = itemsAlquilados.reduce((acc, item) => {
    const devuelta = entregaParcial ? Number(cantidadesDevueltas[item.id] ?? item.cantidad) : item.cantidad;
    const pendiente = Math.max(0, item.cantidad - devuelta);
    return acc + pendiente;
  }, 0);

  const handleProcesarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (entregaParcial && totalPendiente === 0) {
      alert("Si la entrega es parcial, al menos un ítem debe quedar con cantidad pendiente.");
      return;
    }

    try {
      setProcessingCierre(true);
      const payload = {
        observaciones: [notasEntrega, entregaParcial ? detalleParcial : "", tieneDanos ? `Daños: ${detalleDanos}` : ""]
          .filter(Boolean)
          .join(" | "),
        recargo_roturas: tieneDanos ? Number(cobroDanos || 0) : 0,
        recargo_tarde: fueraTermino ? Number(cobroPenalizacion || 0) : 0,
        recargo_otros: 0,
        items: itemsAlquilados.map((item) => ({
          alquiler_item_id: item.id,
          cantidad_devuelta: entregaParcial
            ? Number(cantidadesDevueltas[item.id] ?? 0)
            : item.cantidad,
          estado_fisico: tieneDanos ? "daniado" : "ok",
          observaciones: entregaParcial
            ? `Devuelto ${Number(cantidadesDevueltas[item.id] ?? 0)} de ${item.cantidad}${detalleParcial ? ` - ${detalleParcial}` : ""}`
            : null,
          recargo_item: 0,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/alquileres/${id}/cierre`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo registrar la devolución");
      }

      navigate("/app/alquileres");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error inesperado al cerrar el alquiler");
    } finally {
      setProcessingCierre(false);
    }
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen font-sans">
      {/* Región de Encabezado de Página */}
      <header className="bg-gradient-to-br from-[#1b6f5c] via-[#165a4b] to-[#0f3d33] px-5 pt-5 pb-10 text-white shadow-md">
        <button
          onClick={() => navigate("/app/alquileres")}
          className="flex items-center gap-1.5 text-white/90 hover:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-2 py-1.5 transition-colors bg-white/10 text-xs font-semibold"
          aria-label="Volver a la lista general de alquileres"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Volver a Alquileres</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-1">
            Registro Operativo #{alquiler.id}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            Alquiler de {alquiler.cliente_nombre}
          </h1>
        </div>
      </header>

      {/* Región del Contenido Principal */}
      <main className="px-4 -mt-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bloque de Estado Grande y Protagónico */}
        <section 
          aria-labelledby="estado-contrato-titulo"
          className={`md:col-span-3 bg-white rounded-2xl border ${meta.border} p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
        >
          <div className="flex items-start gap-4">
            <div 
              className={`w-12 h-12 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center flex-shrink-0 border border-current/10`}
              aria-hidden="true"
            >
              <EstadoIcon size={24} />
            </div>
            <div>
              <span className={`text-xs font-black uppercase tracking-wider ${meta.text}`} id="estado-contrato-titulo">
                Estado del Contrato
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{meta.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
            </div>
          </div>
        </section>

        {/* Columna Izquierda: Información de Equipos e Interacciones */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Bloque de Equipos adaptado a Multi-ítem */}
          <section aria-labelledby="inventario-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 id="inventario-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Package size={14} className="text-[#218a72]" aria-hidden="true" /> Detalle del Inventario Alquilado
              </h2>
              <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full" aria-label={`${itemsAlquilados.length} elementos en total`}>
                {itemsAlquilados.length} {itemsAlquilados.length === 1 ? 'Ítem' : 'Ítems'}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" aria-label="Lista detallada de equipos alquilados y costos individuales">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th scope="col" className="py-3 px-5">Equipo / Componente</th>
                    <th scope="col" className="py-3 px-4 text-center">Cant.</th>
                    <th scope="col" className="py-3 px-4 text-right">Precio/Día</th>
                    <th scope="col" className="py-3 px-5 text-right">Subtotal ({dias}d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {itemsAlquilados.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-gray-900">{item.nombre}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-600 bg-gray-50/40">{item.cantidad}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-600">{formatMonto(item.precio)}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-gray-900">{formatMonto(item.precio * item.cantidad * dias)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Formulario de Recepción y Entrega */}
          {estadoVista !== "finalizado" && (
            <section aria-labelledby="form-devolucion-titulo" className="bg-white rounded-2xl border-2 border-[#218a72]/30 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#218a72] to-[#165a4b] px-5 py-3 text-white flex items-center gap-2">
                <ClipboardCheck size={18} aria-hidden="true" />
                <h2 id="form-devolucion-titulo" className="text-sm font-bold uppercase tracking-wider">Registrar Devolución de Equipos</h2>
              </div>
              
              <form onSubmit={handleProcesarEntrega} className="p-5 space-y-5">
                
                {/* Caso A y B: Control de Entrega Completa vs Parcial */}
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    ¿Cómo es la entrega del inventario?
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        !entregaParcial
                          ? "border-[#218a72] bg-[#218a72]/5 ring-2 ring-[#218a72]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEntrega"
                        checked={!entregaParcial}
                        onChange={() => setEntregaParcial(false)}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold text-gray-900">Completa (Tiempo y Forma)</span>
                      <span className="text-[11px] text-gray-500 mt-0.5">Se devuelve todo lo solicitado.</span>
                    </label>
                    
                    <label 
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        entregaParcial
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEntrega"
                        checked={entregaParcial}
                        aria-expanded={entregaParcial}
                        aria-controls="seccion-detalle-parcial"
                        onChange={() => setEntregaParcial(true)}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold text-amber-900">Parcial (Incompleto)</span>
                      <span className="text-[11px] text-amber-600/80 mt-0.5">Faltan unidades o accesorios.</span>
                    </label>
                  </div>

                  {entregaParcial && (
                    <div id="seccion-detalle-parcial" className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex gap-2 text-amber-800">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <label htmlFor="textarea-parcial" className="text-xs font-medium">Especifica detalladamente qué elementos quedan pendientes de devolución.</label>
                      </div>
                      <textarea
                        id="textarea-parcial"
                        rows={2}
                        value={detalleParcial}
                        onChange={(e) => setDetalleParcial(e.target.value)}
                        placeholder="Ej: Falta entregar 1 cable HDMI y el trípode secundario."
                        className="w-full text-xs p-2.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                        required={entregaParcial}
                      />
                    </div>
                  )}
                </fieldset>

                {entregaParcial && (
                  <section className="space-y-2" aria-label="Cantidades devueltas por ítem">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cantidad devuelta por ítem
                    </p>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-3">
                      {itemsAlquilados.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                          <div className="col-span-7 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{item.nombre}</p>
                            <p className="text-[11px] text-gray-500">Prestadas: {item.cantidad}</p>
                          </div>
                          <div className="col-span-5">
                            <input
                              type="number"
                              min={0}
                              max={item.cantidad}
                              step={1}
                              value={cantidadesDevueltas[item.id] ?? 0}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                const safeValue = Number.isFinite(value)
                                  ? Math.min(item.cantidad, Math.max(0, value))
                                  : 0;
                                setCantidadesDevueltas((prev) => ({
                                  ...prev,
                                  [item.id]: safeValue,
                                }));
                              }}
                              className="w-full text-xs p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-right"
                              aria-label={`Cantidad devuelta de ${item.nombre}`}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="text-[11px] font-semibold text-amber-900 border-t border-amber-200 pt-2">
                        Pendiente total por devolver: {totalPendiente}
                      </div>
                    </div>
                  </section>
                )}

                <hr className="border-gray-100" aria-hidden="true" />

                {/* Caso C: Control de Daños / Roturas */}
                <div className="space-y-3">
                  <label htmlFor="input-danos" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="input-danos"
                      type="checkbox"
                      checked={tieneDanos}
                      aria-expanded={tieneDanos}
                      aria-controls="seccion-detalle-danos"
                      onChange={(e) => setTieneDanos(e.target.checked)}
                      className="w-4 h-4 rounded text-[#218a72] focus:ring-[#218a72] border-gray-300"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-800 block">El equipo presenta roturas / anomalías</span>
                      <span className="text-gray-400 text-[11px]">Afecta el depósito de garantía o genera cobro extra</span>
                    </div>
                  </label>

                  {tieneDanos && (
                    <div id="seccion-detalle-danos" className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <div className="sm:col-span-1">
                        <label htmlFor="monto-danos" className="text-[10px] font-bold text-rose-900 uppercase block mb-1">Monto de Recargo ($)</label>
                        <input
                          id="monto-danos"
                          type="number"
                          min="0"
                          value={cobroDanos || ""}
                          onChange={(e) => setCobroDanos(Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full text-xs p-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                          required={tieneDanos}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="descripcion-danos" className="text-[10px] font-bold text-rose-900 uppercase block mb-1">Descripción del daño</label>
                        <input
                          id="descripcion-danos"
                          type="text"
                          value={detalleDanos}
                          onChange={(e) => setDetalleDanos(e.target.value)}
                          placeholder="Ej: Lente rayado / Carcasa golpeada"
                          className="w-full text-xs p-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          required={tieneDanos}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" aria-hidden="true" />

                {/* Caso D: Control de Fuera de Término */}
                <div className="space-y-3">
                  <label htmlFor="input-retraso" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="input-retraso"
                      type="checkbox"
                      checked={fueraTermino}
                      aria-expanded={fueraTermino}
                      aria-controls="seccion-detalle-retraso"
                      onChange={(e) => setFueraTermino(e.target.checked)}
                      className="w-4 h-4 rounded text-[#218a72] focus:ring-[#218a72] border-gray-300"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-800 block">Entrega fuera de término (Retraso)</span>
                      <span className="text-gray-400 text-[11px]">Aplicar recargos punitorios por entrega tardía</span>
                    </div>
                  </label>

                  {fueraTermino && (
                    <div id="seccion-detalle-retraso" className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 w-full">
                        <label htmlFor="monto-penalizacion" className="text-[10px] font-bold text-orange-900 uppercase block mb-1">Penalización Económica Total ($)</label>
                        <input
                          id="monto-penalizacion"
                          type="number"
                          min="0"
                          value={cobroPenalizacion || ""}
                          onChange={(e) => setCobroPenalizacion(Number(e.target.value))}
                          placeholder="Monto de multa"
                          className="w-full text-xs p-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                          required={fueraTermino}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notas generales de la recepción */}
                <div className="space-y-1">
                  <label htmlFor="notas-recepcion" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Observaciones de Recepción</label>
                  <textarea
                    id="notas-recepcion"
                    rows={2}
                    value={notasEntrega}
                    onChange={(e) => setNotasEntrega(e.target.value)}
                    placeholder="Comentarios opcionales sobre el estado general de cierre..."
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#218a72]"
                  />
                </div>

                {/* Botón enviar */}
                <button
                  type="submit"
                  disabled={processingCierre}
                  className="w-full py-3 bg-[#218a72] hover:bg-[#165a4b] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#165a4b] active:scale-[0.99]"
                >
                  {processingCierre ? "Procesando devolución..." : "Procesar Cierre y Confirmar Recepción"}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* Columna Derecha: Liquidación y Fechas */}
        <div className="space-y-6 md:sticky md:top-[104px] md:self-start">
          {/* Bloque Período */}
          <section aria-labelledby="cronograma-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 id="cronograma-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 pt-4 pb-1">
              Cronograma contractual
            </h2>
            <div className="px-5 pb-3">
              <InfoRow icon={CalendarDays} label="Fecha de emisión" value={formatFecha(alquiler.fecha_inicio)} />
              <InfoRow icon={CalendarDays} label="Pactado para devolver" value={formatFecha(alquiler.fecha_fin)} />
              <InfoRow icon={Clock} label="Tiempo total" value={`${dias} ${dias === 1 ? "día" : "días"}`} highlight />
            </div>
          </section>

          {/* Resumen Económico Completo */}
          <section aria-labelledby="liquidacion-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 id="liquidacion-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 pt-4 pb-1">
              Liquidación Comercial
            </h2>
            <div className="px-5 pb-2">
              <InfoRow icon={Banknote} label="Subtotal Neto Ítems" value={formatMonto(subtotal)} />
              <InfoRow
                icon={ShieldCheck}
                label="Garantía de Resguardo"
                value={Number(alquiler.deposito_garantia || 0) > 0 ? formatMonto(Number(alquiler.deposito_garantia || 0)) : "Sin depósito"}
              />
              
              {/* Desglose dinámico si hay penalizaciones en el formulario */}
              {cargosAdicionales > 0 && (
                <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-100 my-2 space-y-1 text-xs">
                  <span className="font-bold text-rose-900 block text-[10px] uppercase">Recargos aplicados en la entrega:</span>
                  {tieneDanos && <div className="flex justify-between text-rose-800"><span>• Por Daños:</span> <span className="font-semibold">{formatMonto(cobroDanos)}</span></div>}
                  {fueraTermino && <div className="flex justify-between text-rose-800"><span>• Por Retraso:</span> <span className="font-semibold">{formatMonto(cobroPenalizacion)}</span></div>}
                </div>
              )}
            </div>

            {/* Total Destacado Dinámico (Anuncia los cambios al lector automáticamente) */}
            <div 
              className="mx-4 mb-4 mt-1 rounded-xl bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-inner"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monto Total Estimado</span>
              </div>
              <span className="text-xl font-black text-emerald-400">
                <span className="sr-only">Total: </span>{formatMonto(balanceFinal)}
              </span>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}