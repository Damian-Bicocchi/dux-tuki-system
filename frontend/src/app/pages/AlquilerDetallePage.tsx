import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Mail,
  Package,
  PenTool,
  Phone,
  Save,
  ShieldAlert,
  User,
} from 'lucide-react';

type EstadoAlquiler = 'pendiente' | 'activo' | 'devuelto' | 'cancelado';
type EstadoFisico = 'ok' | 'daniado' | 'perdido';
type EstadoEntrega = 'pendiente' | 'parcial' | 'cerrado';

interface AlquilerItemApi {
  id: number;
  alquiler_id: number;
  articulo_id: number;
  articulo_nombre: string;
  cantidad: number;
  precio_unitario_dia: number;
  precio_articulo_actual: number;
  cierre_item_id?: number | null;
  cantidad_devuelta?: number | null;
  cierre_estado_fisico?: EstadoFisico | null;
  cierre_observaciones?: string | null;
  cierre_recargo_item?: number | null;
}

interface CierreItemForm {
  alquiler_item_id: number;
  articulo_nombre: string;
  cantidad_prestada: number;
  cantidad_devuelta: number;
  estado_fisico: EstadoFisico;
  observaciones: string;
  recargo_item: number;
}

interface AlquilerDetalleApi {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string | null;
  cliente_telefono: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoAlquiler;
  precio_total: number;
  notas: string | null;
  items: AlquilerItemApi[];
  cierre: null | {
    id: number;
    observaciones: string | null;
    recargo_roturas: number;
    recargo_tarde: number;
    recargo_otros: number;
    total_recargos: number;
    estado_entrega: EstadoEntrega;
    fecha_cierre: string | null;
    items: Array<{
      id: number;
      alquiler_item_id: number;
      cantidad_prestada: number;
      cantidad_devuelta: number;
      estado_fisico: EstadoFisico;
      observaciones: string | null;
      recargo_item: number;
    }>;
  };
}

const API_URL = 'http://localhost:3001/api/alquileres';

function formatFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(monto || 0);
}

function calcularDias(inicio: string, fin: string) {
  const diff = new Date(`${fin}T00:00:00`).getTime() - new Date(`${inicio}T00:00:00`).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function estadoBadge(estado: EstadoAlquiler) {
  switch (estado) {
    case 'pendiente':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'devuelto':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

function estadoEntregaBadge(estado: EstadoEntrega) {
  switch (estado) {
    case 'cerrado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'parcial':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

export default function AlquilerDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alquiler, setAlquiler] = useState<AlquilerDetalleApi | null>(null);
  const [itemsForm, setItemsForm] = useState<CierreItemForm[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [recargoRoturas, setRecargoRoturas] = useState(0);
  const [recargoTarde, setRecargoTarde] = useState(0);
  const [recargoOtros, setRecargoOtros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDetalle() {
      if (!id) {
        navigate('/app/alquileres', { replace: true });
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.status === 404) {
          navigate('/app/alquileres', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error('No se pudo cargar el alquiler');
        }

        const data = (await response.json()) as AlquilerDetalleApi;
        if (!active) return;

        setAlquiler(data);
        setObservaciones(data.cierre?.observaciones ?? '');
        setRecargoRoturas(data.cierre?.recargo_roturas ?? 0);
        setRecargoTarde(data.cierre?.recargo_tarde ?? 0);
        setRecargoOtros(data.cierre?.recargo_otros ?? 0);
        setItemsForm(
          data.items.map((item) => {
            const cierreItem = data.cierre?.items.find((ci) => ci.alquiler_item_id === item.id);
            return {
              alquiler_item_id: item.id,
              articulo_nombre: item.articulo_nombre,
              cantidad_prestada: item.cantidad,
              cantidad_devuelta: cierreItem?.cantidad_devuelta ?? item.cantidad_devuelta ?? 0,
              estado_fisico: cierreItem?.estado_fisico ?? item.cierre_estado_fisico ?? 'ok',
              observaciones: cierreItem?.observaciones ?? item.cierre_observaciones ?? '',
              recargo_item: cierreItem?.recargo_item ?? item.cierre_recargo_item ?? 0,
            };
          })
        );
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Error inesperado');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetalle();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const dias = alquiler ? calcularDias(alquiler.fecha_inicio, alquiler.fecha_fin) : 1;

  const subtotalDevolucion = useMemo(
    () =>
      itemsForm.reduce(
        (acc, item) => acc + item.cantidad_devuelta * dias * 0,
        0,
      ),
    [itemsForm, dias],
  );

  const totalRecargos = useMemo(
    () =>
      recargoRoturas +
      recargoTarde +
      recargoOtros +
      itemsForm.reduce((acc, item) => acc + (Number(item.recargo_item) || 0), 0),
    [itemsForm, recargoRoturas, recargoTarde, recargoOtros],
  );

  const itemsCompletos = itemsForm.every((item) => item.cantidad_devuelta >= item.cantidad_prestada);
  const cantidadPendiente = itemsForm.filter((item) => item.cantidad_devuelta < item.cantidad_prestada).length;
  const estadoEntregaActual: EstadoEntrega = alquiler?.cierre?.estado_entrega ?? (itemsForm.length === 0 ? 'pendiente' : itemsCompletos ? 'cerrado' : 'parcial');

  function updateItem(index: number, patch: Partial<CierreItemForm>) {
    setItemsForm((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  function marcarTodosComoDevueltos() {
    setItemsForm((current) =>
      current.map((item) => ({
        ...item,
        cantidad_devuelta: item.cantidad_prestada,
        estado_fisico: 'ok',
        recargo_item: item.recargo_item || 0,
      })),
    );
  }

  async function handleSave() {
    if (!alquiler) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/${alquiler.id}/cierre`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observaciones,
          recargo_roturas: recargoRoturas,
          recargo_tarde: recargoTarde,
          recargo_otros: recargoOtros,
          items: itemsForm.map((item) => ({
            alquiler_item_id: item.alquiler_item_id,
            cantidad_devuelta: item.cantidad_devuelta,
            estado_fisico: item.estado_fisico,
            observaciones: item.observaciones,
            recargo_item: item.recargo_item,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo guardar el cierre');
      }

      setAlquiler(payload as AlquilerDetalleApi);
      setObservaciones(payload.cierre?.observaciones ?? '');
      setRecargoRoturas(payload.cierre?.recargo_roturas ?? 0);
      setRecargoTarde(payload.cierre?.recargo_tarde ?? 0);
      setRecargoOtros(payload.cierre?.recargo_otros ?? 0);
      setItemsForm(
        (payload as AlquilerDetalleApi).items.map((item) => ({
          alquiler_item_id: item.id,
          articulo_nombre: item.articulo_nombre,
          cantidad_prestada: item.cantidad,
          cantidad_devuelta: item.cierre_item_id ? item.cantidad_devuelta ?? item.cantidad : item.cantidad_devuelta ?? 0,
          estado_fisico: item.cierre_estado_fisico ?? 'ok',
          observaciones: item.cierre_observaciones ?? '',
          recargo_item: item.cierre_recargo_item ?? 0,
        })),
      );
      setSuccess('El cierre del alquiler fue guardado correctamente.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500 px-5">
        <LoaderCircle className="animate-spin text-[#218a72]" size={34} />
        <p className="font-medium text-center">Cargando detalle del alquiler...</p>
      </div>
    );
  }

  if (!alquiler) {
    return null;
  }

  return (
    <div className="pb-10 min-h-screen bg-gradient-to-b from-white via-[#f7fbfa] to-white">
      <div className="bg-gradient-to-br from-[#1b6f5c] via-[#218a72] to-[#0f3d33] px-5 pt-4 pb-6 text-white shadow-lg">
        <button
          onClick={() => navigate('/app/alquileres')}
          className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-2 py-1 transition-colors bg-white/10"
          aria-label="Volver al listado de alquileres"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="text-sm font-semibold">Alquileres</span>
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 mb-2">Detalle del alquiler</p>
            <h1 className="text-2xl font-black leading-tight">{alquiler.cliente_nombre}</h1>
            <p className="text-white/75 text-sm mt-2">
              #{alquiler.id.toString().padStart(4, '0')} · {alquiler.items.length} ítem{alquiler.items.length !== 1 ? 's' : ''} · {formatMonto(alquiler.precio_total)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-white/20 ${estadoBadge(alquiler.estado)}`}>
              {alquiler.estado.charAt(0).toUpperCase() + alquiler.estado.slice(1)}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-white/20 ${estadoEntregaBadge(estadoEntregaActual)}`}>
              Cierre {estadoEntregaActual}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-800">
            <p className="font-bold mb-1">No se pudo completar la operación</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-green-800">
            <p className="font-bold mb-1">Cierre guardado</p>
            <p className="text-sm">{success}</p>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InfoCard icon={User} label="Cliente" value={alquiler.cliente_nombre} />
          <InfoCard icon={CalendarDays} label="Período" value={`${formatFecha(alquiler.fecha_inicio)} → ${formatFecha(alquiler.fecha_fin)}`} />
          <InfoCard icon={BadgeDollarSign} label="Total alquiler" value={formatMonto(alquiler.precio_total)} />
        </section>

        <section className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">Datos del cliente</h2>
              <p className="text-sm text-gray-500">Resumen rápido para confirmar la entrega y el cierre.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <InfoCard icon={Mail} label="Correo" value={alquiler.cliente_email || 'Sin correo'} />
            <InfoCard icon={Phone} label="Teléfono" value={alquiler.cliente_telefono || 'Sin teléfono'} />
            <InfoCard icon={FileText} label="Notas" value={alquiler.notas || 'Sin notas'} />
          </div>
        </section>

        <section className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">Elementos alquilados</h2>
              <p className="text-sm text-gray-500">Cada línea muestra lo prestado y el seguimiento de devolución.</p>
            </div>
            <button
              onClick={marcarTodosComoDevueltos}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#218a72] text-white text-sm font-bold hover:bg-[#1b6f5c] transition-colors"
            >
              <CheckCircle2 size={16} />
              Marcar todo como devuelto
            </button>
          </div>

          <div className="space-y-3">
            {itemsForm.map((item, index) => {
              const subtotal = item.cantidad_prestada * dias * 0;
              return (
                <div key={item.alquiler_item_id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1b6f5c] mb-1">Ítem #{index + 1}</p>
                      <h3 className="font-black text-gray-900 text-base">{item.articulo_nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Prestado: {item.cantidad_prestada} unidad{item.cantidad_prestada !== 1 ? 'es' : ''}
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.cantidad_devuelta >= item.cantidad_prestada}
                        onChange={(e) =>
                          updateItem(index, {
                            cantidad_devuelta: e.target.checked ? item.cantidad_prestada : 0,
                            estado_fisico: 'ok',
                          })
                        }
                        className="rounded border-gray-300 text-[#218a72] focus:ring-[#218a72]"
                      />
                      Devuelto completo
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Cantidad devuelta">
                      <input
                        type="number"
                        min={0}
                        max={item.cantidad_prestada}
                        value={item.cantidad_devuelta}
                        onChange={(e) => updateItem(index, { cantidad_devuelta: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
                      />
                    </Field>

                    <Field label="Estado físico">
                      <select
                        value={item.estado_fisico}
                        onChange={(e) => updateItem(index, { estado_fisico: e.target.value as EstadoFisico })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
                      >
                        <option value="ok">OK</option>
                        <option value="daniado">Dañado</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Recargo por ítem">
                      <input
                        type="number"
                        min={0}
                        value={item.recargo_item}
                        onChange={(e) => updateItem(index, { recargo_item: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
                      />
                    </Field>

                    <Field label="Subtotal de referencia">
                      <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-500 font-semibold">
                        {formatMonto(subtotal)}
                      </div>
                    </Field>
                  </div>

                  <Field label="Observaciones del ítem">
                    <textarea
                      value={item.observaciones}
                      onChange={(e) => updateItem(index, { observaciones: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] resize-y"
                      placeholder="Cómo se devolvió, faltantes, detalles visibles..."
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">Cierre general</h2>
            <p className="text-sm text-gray-500">Observaciones finales y cargos adicionales del alquiler completo.</p>
          </div>

          <Field label="Observaciones de devolución">
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] resize-y"
              placeholder="Cómo se devolvió todo, si hubo faltantes o diferencias..."
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Recargo por roturas">
              <input
                type="number"
                min={0}
                value={recargoRoturas}
                onChange={(e) => setRecargoRoturas(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
              />
            </Field>
            <Field label="Recargo por demora">
              <input
                type="number"
                min={0}
                value={recargoTarde}
                onChange={(e) => setRecargoTarde(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
              />
            </Field>
            <Field label="Otros recargos">
              <input
                type="number"
                min={0}
                value={recargoOtros}
                onChange={(e) => setRecargoOtros(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
              />
            </Field>
          </div>

          <div className="rounded-2xl bg-[#f7fbfa] border border-[#d7ebe5] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 font-semibold">Estado de entrega</p>
              <p className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${estadoEntregaBadge(estadoEntregaActual)}`}>
                {estadoEntregaActual.charAt(0).toUpperCase() + estadoEntregaActual.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Ítems pendientes</p>
              <p className="mt-1 text-lg font-black text-gray-900">{cantidadPendiente}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Recargos totales</p>
              <p className="mt-1 text-lg font-black text-[#1b6f5c]">{formatMonto(totalRecargos)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              El alquiler quedará marcado como <span className="font-bold text-gray-700">devuelto</span> al guardar el cierre.
            </p>

            <button
              onClick={handleSave}
              disabled={saving || alquiler.estado === 'cancelado'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#218a72] text-white font-bold hover:bg-[#1b6f5c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar cierre
            </button>
          </div>

          {alquiler.estado === 'cancelado' && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-800 flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">Este alquiler está cancelado y no se puede cerrar ni modificar desde esta pantalla.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
        <Icon size={14} className="text-[#1b6f5c]" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-gray-800 break-words">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-bold text-gray-700">{label}</span>
      {children}
    </label>
  );
}