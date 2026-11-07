import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Package,
  Banknote,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { Can } from "../components/ui/Can";
import { SuccessModal } from "../components/SuccessModal";
import { useUnsavedChangesWarning } from "../hooks/useUnsavedChangesWarning";
import {
  ESTADO_ALQUILER_META,
  estadoEfectivoAlquiler,
} from "../config/rentalStatus";
import type { EstadoAlquiler } from "../config/rentalStatus";
import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

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
  estado: EstadoAlquiler;
  deposito_garantia: number;
  notas?: string;
  cancelacion_motivo?: string | null;
  cancelacion_recargo?: number | null;
  cancelacion_fecha?: string | null;
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
  if (!fecha) return "—";
  const [soloFecha] = fecha.split(" ");
  const [y, m, d] = soloFecha.split("-");
  if (!y || !m || !d) return fecha;
  return `${d}/${m}/${y}`;
}

function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);
}



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
      <div className="w-8 h-8 rounded-lg bg-[#218a72]/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
        <Icon size={16} className="text-[#218a72]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
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

  const [entregaParcial, setEntregaParcial] = useState(false);
  const [detalleParcial, setDetalleParcial] = useState("");
  const [tieneDanos, setTieneDanos] = useState(false);
  const [cobroDanos, setCobroDanos] = useState<number | "">("");
  const [detalleDanos, setDetalleDanos] = useState("");
  const [fueraTermino, setFueraTermino] = useState(false);
  const [cobroPenalizacion, setCobroPenalizacion] = useState<number | "">("");
  const [notasEntrega, setNotasEntrega] = useState("");
  const [processingCierre, setProcessingCierre] = useState(false);
  const [cantidadesDevueltas, setCantidadesDevueltas] = useState<
    Record<number, number | "">
  >({});

  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [recargoCancelacion, setRecargoCancelacion] = useState<number | "">("");
  const [processingCancelacion, setProcessingCancelacion] = useState(false);
  const [cancelacionError, setCancelacionError] = useState<string | null>(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);

  const [processingInicio, setProcessingInicio] = useState(false);
  const [inicioError, setInicioError] = useState<string | null>(null);
  const [showInicioSuccess, setShowInicioSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAlquiler() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/alquileres/${id}`, {headers:getAuthHeaders()});
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

  const hoy = new Date().toISOString().slice(0, 10);
  const estadoVistaParaDirty = alquiler
    ? estadoEfectivoAlquiler(alquiler.estado, alquiler.fecha_fin)
    : null;
  const puedeCancelar = Boolean(
    alquiler &&
      (alquiler.estado === "pendiente" ||
        (alquiler.estado === "activo" &&
          alquiler.fecha_inicio > hoy)),
  );
  const puedeIniciar = Boolean(
    alquiler &&
      alquiler.estado === "pendiente" &&
      alquiler.fecha_inicio <= hoy,
  );
  const puedeRegistrarDevolucion = Boolean(
    alquiler &&
      estadoVistaParaDirty &&
      alquiler.fecha_inicio <= hoy &&
      ["activo", "vencido"].includes(estadoVistaParaDirty),
  );
  const cantidadesModificadas = itemsAlquilados.some(
    (item) =>
      Number(cantidadesDevueltas[item.id] ?? item.cantidad) !== item.cantidad,
  );
  const devolucionDirty =
    puedeRegistrarDevolucion &&
    (entregaParcial ||
      detalleParcial.trim() !== "" ||
      tieneDanos ||
      cobroDanos !== "" ||
      detalleDanos.trim() !== "" ||
      fueraTermino ||
      cobroPenalizacion !== "" ||
      notasEntrega.trim() !== "" ||
      cantidadesModificadas);
  const cancelacionDirty =
    puedeCancelar &&
    (motivoCancelacion.trim() !== "" || recargoCancelacion !== "");

  const { allowNavigation } = useUnsavedChangesWarning(
    !loading && (devolucionDirty || cancelacionDirty),
  );

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
          className="px-5 py-3 bg-[#218a72] text-white rounded-xl font-bold transition-transform active:scale-95 text-sm"
        >
          Volver a alquileres
        </button>
      </div>
    );
  }

  const estadoVista = estadoVistaParaDirty as EstadoAlquiler;
  const meta = ESTADO_ALQUILER_META[estadoVista];
  const EstadoIcon = meta.icon;
  const dias = calcularDias(alquiler.fecha_inicio, alquiler.fecha_fin);

  const subtotal = itemsAlquilados.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad * dias), 0);
  const totalOriginal = subtotal + Number(alquiler.deposito_garantia || 0);
  const cargosAdicionales =
    (tieneDanos ? Number(cobroDanos) || 0 : 0) +
    (fueraTermino ? Number(cobroPenalizacion) || 0 : 0);
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
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo registrar la devolución");
      }

      allowNavigation();
      navigate("/app/alquileres");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error inesperado al cerrar el alquiler");
    } finally {
      setProcessingCierre(false);
    }
  };

  const handleIniciar = async () => {
    if (!id) return;

    try {
      setProcessingInicio(true);
      setInicioError(null);

      const response = await fetch(
        `${API_BASE_URL}/alquileres/${id}/iniciar`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar el alquiler.");
      }

      setAlquiler(data as AlquilerApi);
      setShowInicioSuccess(true);
    } catch (err) {
      setInicioError(
        err instanceof Error
          ? err.message
          : "Error inesperado al iniciar el alquiler.",
      );
    } finally {
      setProcessingInicio(false);
    }
  };

  const handleCancelar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!motivoCancelacion.trim()) {
      setCancelacionError("El motivo de cancelación es obligatorio.");
      return;
    }

    try {
      setProcessingCancelacion(true);
      setCancelacionError(null);

      const response = await fetch(
        `${API_BASE_URL}/alquileres/${id}/cancelar`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            motivo: motivoCancelacion.trim(),
            recargo: Number(recargoCancelacion) || 0,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cancelar el alquiler.");
      }

      setAlquiler(data as AlquilerApi);
      setShowCancelSuccess(true);
    } catch (err) {
      setCancelacionError(
        err instanceof Error
          ? err.message
          : "Error inesperado al cancelar el alquiler.",
      );
    } finally {
      setProcessingCancelacion(false);
    }
  };

  return (
    <div className="pb-12 bg-gray-50 min-h-screen font-sans">
      <SuccessModal
        isOpen={showCancelSuccess}
        title="Alquiler cancelado"
        message="El alquiler fue cancelado correctamente y el stock quedó liberado."
        onClose={() => setShowCancelSuccess(false)}
      />
      <SuccessModal
        isOpen={showInicioSuccess}
        title="Alquiler iniciado"
        message="El alquiler ahora está activo."
        onClose={() => setShowInicioSuccess(false)}
      />

      {/* Encabezado Homogéneo */}
      <header className="bg-gradient-to-br from-[#1b6f5c] via-[#165a4b] to-[#0f3d33] px-5 pt-5 pb-8 text-white shadow-md">
        <button
          onClick={() => navigate("/app/alquileres")}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-5 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-3 py-1.5 transition-colors bg-white/10 text-xs font-semibold w-fit"
          aria-label="Volver a Alquileres"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Volver a Alquileres</span>
        </button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Alquiler de {alquiler.cliente_nombre} - Registro Operativo #{alquiler.id}
          </h1>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="px-4 -mt-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section 
          aria-labelledby="estado-contrato-titulo"
          className={`md:col-span-3 bg-white rounded-xl border ${meta.border} p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${meta.bg} ${meta.text} flex items-center justify-center flex-shrink-0 border border-current/10`}
              aria-hidden="true"
            >
              <EstadoIcon size={22} />
            </div>
            <div>
              <span className={`text-xs font-black uppercase tracking-wider ${meta.text}`} id="estado-contrato-titulo">
                Estado del Contrato
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">{meta.label}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{meta.description}</p>
            </div>
          </div>

          {puedeIniciar && (
            <Can do="permiso_para_editar_alquileres">
              <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleIniciar}
                  disabled={processingInicio}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#218a72] hover:bg-[#1b6f5c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
                >
                  <PlayCircle size={18} aria-hidden="true" />
                  {processingInicio ? "Iniciando..." : "Iniciar alquiler"}
                </button>
                {inicioError && (
                  <p
                    role="alert"
                    className="text-xs font-semibold text-red-700"
                  >
                    {inicioError}
                  </p>
                )}
              </div>
            </Can>
          )}
        </section>

        <div className="md:col-span-2 space-y-6">
          <section aria-labelledby="inventario-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 id="inventario-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Package size={14} className="text-[#218a72]" aria-hidden="true" /> Detalle del Inventario Alquilado
              </h2>
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {itemsAlquilados.length} {itemsAlquilados.length === 1 ? 'Ítem' : 'Ítems'}
              </span>
            </div>
            
            <div>
            {/* Vista Celular: Tarjetas estilizadas */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {itemsAlquilados.map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-3.5 space-y-2.5 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-gray-900 text-sm leading-snug">
                      {item.nombre}
                    </span>
                    <span className="bg-emerald-50 text-[#165a4b] text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 border border-emerald-100">
                      x{item.cantidad}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end text-xs text-gray-500 pt-1 border-t border-gray-50">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Precio / Día</span>
                      <span className="font-semibold text-gray-700">{formatMonto(item.precio)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Subtotal ({dias}d)</span>
                      <span className="font-extrabold text-sm text-gray-900">{formatMonto(item.precio * item.cantidad * dias)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Tablet / Desktop: Tabla tradicional */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-sm" aria-label="Lista detallada de equipos alquilados">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th scope="col" className="py-2.5 px-4">Equipo</th>
                    <th scope="col" className="py-2.5 px-3 text-center">Cant.</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Precio/Día</th>
                    <th scope="col" className="py-2.5 px-4 text-right">Subtotal ({dias}d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsAlquilados.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 break-words">{item.nombre}</td>
                      <td className="py-3 px-3 text-center font-bold text-gray-700 bg-gray-50/40">{item.cantidad}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-600">{formatMonto(item.precio)}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{formatMonto(item.precio * item.cantidad * dias)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
</div>
          </section>

          <Can do="permiso_para_editar_alquileres">
            {puedeCancelar && (
              <section
                aria-labelledby="cancelacion-titulo"
                className="bg-white rounded-xl border-2 border-red-200 shadow-md overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-700 to-rose-900 px-4 py-2.5 text-white flex items-center gap-2">
                  <XCircle size={18} aria-hidden="true" />
                  <h2
                    id="cancelacion-titulo"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Cancelar alquiler
                  </h2>
                </div>

                <form onSubmit={handleCancelar} className="p-5 space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {alquiler.fecha_inicio > hoy
                      ? `Solo podés cancelar antes de la fecha de inicio (${formatFecha(
                          alquiler.fecha_inicio,
                        )}). El alquiler quedará cancelado y el stock se liberará.`
                      : `El alquiler sigue pendiente, por lo que podés cancelarlo aunque su fecha de inicio (${formatFecha(
                          alquiler.fecha_inicio,
                        )}) ya haya pasado. El stock se liberará.`}
                  </p>

                  <div>
                    <label
                      htmlFor="cancelacion-motivo"
                      className="block text-sm font-bold text-gray-800 mb-2"
                    >
                      Motivo de cancelación{" "}
                      <span className="text-xs text-red-600 font-semibold">
                        (obligatorio)
                      </span>
                    </label>
                    <textarea
                      id="cancelacion-motivo"
                      rows={3}
                      maxLength={300}
                      required
                      value={motivoCancelacion}
                      onChange={(e) => {
                        setMotivoCancelacion(e.target.value);
                        if (cancelacionError) setCancelacionError(null);
                      }}
                      placeholder="Explicá por qué se cancela el alquiler..."
                      className="w-full text-sm p-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cancelacion-recargo"
                      className="block text-sm font-bold text-gray-800 mb-2"
                    >
                      Recargo por cancelación ($){" "}
                      <span className="text-xs text-gray-500 font-medium">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id="cancelacion-recargo"
                      type="number"
                      min="0"
                      step="0.01"
                      value={recargoCancelacion}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setRecargoCancelacion(
                          raw === "" ? "" : Math.max(0, Number(raw)),
                        );
                      }}
                      className="w-full text-sm p-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  {cancelacionError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 font-medium"
                    >
                      {cancelacionError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processingCancelacion}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
                  >
                    {processingCancelacion
                      ? "Cancelando..."
                      : "Confirmar cancelación"}
                  </button>
                </form>
              </section>
            )}
          </Can>

          {puedeRegistrarDevolucion && (
            <section aria-labelledby="form-devolucion-titulo" className="bg-white rounded-xl border-2 border-[#218a72]/30 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#218a72] to-[#165a4b] px-4 py-2.5 text-white flex items-center gap-2">
                <ClipboardCheck size={18} aria-hidden="true" />
                <h2 id="form-devolucion-titulo" className="text-sm font-bold uppercase tracking-wider">Registrar Devolución</h2>
              </div>

              <Can do="permiso_para_cerrar_alquileres">
              <form onSubmit={handleProcesarEntrega} className="p-5 space-y-5">
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Tipo de entrega
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
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
                      <span className="text-sm font-bold text-gray-900">Completa</span>
                      <span className="text-xs text-gray-500">Todo devuelto</span>
                    </label>
                    <label
                      className={`p-3 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
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
                      <span className="text-sm font-bold text-amber-900">Parcial</span>
                      <span className="text-xs text-amber-700">Faltan unidades</span>
                    </label>
                  </div>

                  {entregaParcial && (
                    <div id="seccion-detalle-parcial" className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                      <div className="flex gap-2 text-amber-800">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <label htmlFor="textarea-parcial" className="text-xs font-medium">Detalle de lo pendiente</label>
                      </div>
                      <textarea
                        id="textarea-parcial"
                        rows={2}
                        maxLength={300}
                        value={detalleParcial}
                        onChange={(e) => setDetalleParcial(e.target.value)}
                        placeholder="Ej: Falta 1 cable HDMI y el trípode."
                        className="w-full text-sm p-2.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
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
                    <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 space-y-3">
                      {itemsAlquilados.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.nombre}</p>
                            <p className="text-xs text-gray-500">Prestadas: {item.cantidad}</p>
                          </div>
                          <div className="w-full sm:w-32">
                            <input
                              type="number"
                              min={0}
                              max={item.cantidad}
                              step={1}
                              value={
                                cantidadesDevueltas[item.id] ?? item.cantidad
                              }
                              onChange={(e) => {
                                const raw = e.target.value;

                                if (raw === "") {
                                  setCantidadesDevueltas((prev) => ({
                                    ...prev,
                                    [item.id]: "",
                                  }));
                                  return;
                                }

                                const value = Number(raw);
                                const safeValue = Number.isFinite(value)
                                  ? Math.min(item.cantidad, Math.max(0, value))
                                  : 0;
                                setCantidadesDevueltas((prev) => ({
                                  ...prev,
                                  [item.id]: safeValue,
                                }));
                              }}
                              className="w-full text-sm p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-right"
                              aria-label={`Cantidad devuelta de ${item.nombre}`}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="text-xs font-bold text-amber-900 border-t border-amber-200 pt-2">
                        Pendiente total: {totalPendiente}
                      </div>
                    </div>
                  </section>
                )}

                <hr className="border-gray-100" aria-hidden="true" />

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
                    <span className="text-sm font-bold text-gray-800">El equipo presenta roturas / anomalías</span>
                  </label>

                  {tieneDanos && (
                    <div id="seccion-detalle-danos" className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <div>
                        <label htmlFor="monto-danos" className="text-xs font-bold text-rose-900 uppercase block mb-1">Monto ($)</label>
                        <input
                          id="monto-danos"
                          type="number"
                          min="0"
                          value={cobroDanos}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setCobroDanos(
                              raw === "" ? "" : Math.max(0, Number(raw)),
                            );
                          }}
                          placeholder="0"
                          className="w-full text-sm p-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold bg-white"
                          required={tieneDanos}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="descripcion-danos" className="text-xs font-bold text-rose-900 uppercase block mb-1">Descripción</label>
                        <input
                          id="descripcion-danos"
                          type="text"
                          maxLength={300}
                          value={detalleDanos}
                          onChange={(e) => setDetalleDanos(e.target.value)}
                          placeholder="Ej: Lente rayado"
                          className="w-full text-sm p-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                          required={tieneDanos}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" aria-hidden="true" />

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
                    <span className="text-sm font-bold text-gray-800">Entrega fuera de término (Retraso)</span>
                  </label>

                  {fueraTermino && (
                    <div id="seccion-detalle-retraso" className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex-1 w-full">
                        <label htmlFor="monto-penalizacion" className="text-xs font-bold text-orange-900 uppercase block mb-1">Penalización ($)</label>
                        <input
                          id="monto-penalizacion"
                          type="number"
                          min="0"
                          value={cobroPenalizacion}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setCobroPenalizacion(
                              raw === "" ? "" : Math.max(0, Number(raw)),
                            );
                          }}
                          placeholder="Monto"
                          className="w-full text-sm p-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold bg-white"
                          required={fueraTermino}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="notas-recepcion" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Observaciones</label>
                  <textarea
                    id="notas-recepcion"
                    rows={2}
                    maxLength={500}
                    value={notasEntrega}
                    onChange={(e) => setNotasEntrega(e.target.value)}
                    placeholder="Comentarios opcionales..."
                    className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#218a72]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processingCierre}
                  className="w-full py-2.5 bg-[#218a72] hover:bg-[#165a4b] text-white font-bold rounded-lg text-sm uppercase tracking-wider shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#165a4b] active:scale-[0.99]"
                >
                  {processingCierre ? "Procesando..." : "Procesar Cierre y Confirmar Recepción"}
                </button>
              </form>
            </Can>
              
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section aria-labelledby="cronograma-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 id="cronograma-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 pt-4 pb-1">
              Cronograma contractual
            </h2>
            <div className="px-4 pb-3">
              <InfoRow icon={CalendarDays} label="Fecha de emisión" value={formatFecha(alquiler.fecha_inicio)} />
              <InfoRow icon={CalendarDays} label="Pactado para devolver" value={formatFecha(alquiler.fecha_fin)} />
              <InfoRow icon={Clock} label="Tiempo total" value={`${dias} ${dias === 1 ? "día" : "días"}`} highlight />
            </div>
          </section>

          <section aria-labelledby="liquidacion-titulo" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 id="liquidacion-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 pt-4 pb-1">
              Liquidación Comercial
            </h2>
            <div className="px-4 pb-1">
              <InfoRow icon={Banknote} label="Subtotal Neto" value={formatMonto(subtotal)} />
              <InfoRow
                icon={ShieldCheck}
                label="Garantía"
                value={Number(alquiler.deposito_garantia || 0) > 0 ? formatMonto(Number(alquiler.deposito_garantia || 0)) : "Sin depósito"}
              />
              
              {cargosAdicionales > 0 && (
                <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-100 my-2 space-y-1 text-sm">
                  <span className="font-bold text-rose-900 block text-xs uppercase">Recargos aplicados:</span>
                  {tieneDanos && <div className="flex justify-between text-rose-800"><span>• Daños:</span> <span className="font-semibold">{formatMonto(Number(cobroDanos) || 0)}</span></div>}
                  {fueraTermino && <div className="flex justify-between text-rose-800"><span>• Retraso:</span> <span className="font-semibold">{formatMonto(Number(cobroPenalizacion) || 0)}</span></div>}
                </div>
              )}
            </div>

            <div 
              className="mx-4 mb-4 mt-1 rounded-xl bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-inner"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Estimado</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-400" aria-describedby="iva-informacion">
                <span className="sr-only">Total: </span>{formatMonto(balanceFinal)}
              </span>
            </div>
          </section>

          {alquiler.estado === "cancelado" && (
            <section
              aria-labelledby="cancelacion-info-titulo"
              className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden"
            >
              <h2
                id="cancelacion-info-titulo"
                className="text-xs font-bold text-red-700 uppercase tracking-wider px-4 pt-3 pb-1"
              >
                Datos de la cancelación
              </h2>
              <div className="px-4 pb-3">
                <InfoRow
                  icon={XCircle}
                  label="Motivo"
                  value={alquiler.cancelacion_motivo || "Sin motivo registrado"}
                />
                <InfoRow
                  icon={Banknote}
                  label="Recargo"
                  value={formatMonto(Number(alquiler.cancelacion_recargo || 0))}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Fecha"
                  value={formatFecha(alquiler.cancelacion_fecha || "")}
                />
              </div>
            </section>
          )}

          {alquiler.notas && (
            <section aria-labelledby="notas-iniciales-titulo" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 id="notas-iniciales-titulo" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 pt-3 pb-1">
                Observaciones iniciales
              </h2>
              <div className="px-4 pb-3">
                <div className="flex items-start gap-2 pt-0.5">
                  <FileText size={16} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-gray-700 text-sm leading-relaxed">{alquiler.notas}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}