import { useState, useCallback, useEffect } from 'react';
import { Calendar, RotateCcw, Package, User, ArrowRight, LogIn, LogOut, Loader2 } from 'lucide-react';

interface Alquiler {
  id: number;
  cliente: string;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  return dateStr.split('-').reverse().join('/');
}

const todayStr = toDateStr(new Date());

const API_URL = 'http://localhost:3001/api';

export const getAlquileresEmpiezanFecha = async (fecha: string): Promise<Alquiler[]> => {
  console.log(`${API_URL}/empiezan?fecha=${(fecha)}`);
  const response = await fetch(`${API_URL}/alquileres/empiezan?fecha=${(fecha)}`);
  if (!response.ok) {
    throw new Error('Error al obtener alquileres por fecha de inicio');
  }
  return response.json();
};

export const getAlquileresTerminanFecha = async (fecha: string): Promise<Alquiler[]> => {
  const response = await fetch(`${API_URL}/alquileres/terminan?fecha=${encodeURIComponent(fecha)}`);
  if (!response.ok) throw new Error('Error al obtener alquileres por fecha de fin');
  return response.json();
};

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  // Estados para almacenar los datos de las peticiones
  const [inicianHoy, setInicianHoy] = useState<Alquiler[]>([]);
  const [vencenHoy, setVencenHoy] = useState<Alquiler[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isToday = selectedDate === todayStr;

  const resetToToday = useCallback(() => setSelectedDate(todayStr), []);

  const labelDia = isToday ? 'Hoy' : formatDateLabel(selectedDate);

  useEffect(() => {
    let isMounted = true; // Previene actualizaciones si el componente se desmonta antes de recibir la respuesta

    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      try {
        const [iniciados, vencidos] = await Promise.all([
          getAlquileresEmpiezanFecha(selectedDate),
          getAlquileresTerminanFecha(selectedDate)
        ]);

        if (isMounted) {
          setInicianHoy(iniciados);
          setVencenHoy(vencidos);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError('Error al consultar los alquileres de la fecha seleccionada.');
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  return (
    <main className="px-5 py-6 pb-10 max-w-5xl mx-auto space-y-5" aria-label="Calendario de Alquileres">
      
      {/* Región asíncrona para lectores de pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {cargando ? 'Cargando alquileres...' : `Mostrando alquileres para ${labelDia}`}
      </div>

      {/* Selector de fecha */}
      <section className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-3" aria-labelledby="picker-title">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#218a72]" aria-hidden="true" />
          <h2 id="picker-title" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Consultar día
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex flex-col">
            <label htmlFor="date-input" className="sr-only">Seleccionar Fecha para filtrar</label>
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors text-sm font-semibold text-gray-800 focus-visible:outline-2 focus-visible:outline-[#218a72]"
            />
          </div>
          {!isToday && (
            <button
              onClick={resetToToday}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.97] text-white rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218a72] flex-shrink-0"
              aria-label="Volver al día de hoy"
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Volver a Hoy</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold text-gray-900 capitalize">
            <span className="sr-only">Fecha seleccionada: </span>{labelDia}
          </p>
          {cargando && (
            <div className="flex items-center gap-2 text-[#218a72] text-xs font-bold">
              <Loader2 size={16} className="animate-spin" />
              <span>Cargando...</span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </section>

      {/* Contenedor en paralelo para los dos cuadros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Sección: Inician el día seleccionado */}
        <Section
          id="sec-inician"
          icon={LogIn}
          title={isToday ? "Inician hoy" : "Inician esta fecha"}
          color="green"
          alquileres={inicianHoy}
          emptyText={cargando ? "Cargando..." : "No hay alquileres que inicien este día"}
          renderExtra={(a) => (
            <DateRange label="Hasta el" fecha={formatDateShort(a.fechaFin)} />
          )}
        />

        {/* Sección: Vencen el día seleccionado */}
        <Section
          id="sec-vencen"
          icon={LogOut}
          title={isToday ? "Vencen hoy" : "Vencen esta fecha"}
          color="yellow"
          alquileres={vencenHoy}
          emptyText={cargando ? "Cargando..." : "No hay alquileres que venzan este día"}
          renderExtra={(a) => (
            <DateRange label="Desde el" fecha={formatDateShort(a.fechaInicio)} />
          )}
        />
      </div>
    </main>
  );
}


type Color = 'green' | 'yellow';

const colorTokens: Record<Color, {
  headerBg: string; headerText: string;
  countBg: string; countText: string;
  cardBorder: string; iconBg: string; iconColor: string;
  badgeBg: string; badgeText: string;
}> = {
  green: {
    headerBg: 'bg-[#165e4e]', 
    headerText: 'text-white',
    countBg: 'bg-white/20', countText: 'text-white',
    cardBorder: 'border-[#a8ddd0]', iconBg: 'bg-[#e1f5ee]', iconColor: 'text-[#165e4e]',
    badgeBg: 'bg-[#e1f5ee]', badgeText: 'text-[#085041]',
  },
  yellow: {
    headerBg: 'bg-[#785002]', 
    headerText: 'text-white',
    countBg: 'bg-white/20', countText: 'text-white',
    cardBorder: 'border-[#f5d97a]', iconBg: 'bg-[#fef9e7]', iconColor: 'text-[#785002]',
    badgeBg: 'bg-[#fef9e7]', badgeText: 'text-[#543603]',
  },
};

function Section({
  id,
  icon: Icon,
  title,
  color,
  alquileres,
  emptyText,
  renderExtra,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  color: Color;
  alquileres: Alquiler[];
  emptyText: string;
  renderExtra: (a: Alquiler) => React.ReactNode;
}) {
  const tk = colorTokens[color];
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} className="w-full">
      {/* Encabezado */}
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-t-2xl ${tk.headerBg}`}>
        <div className="flex items-center gap-2.5">
          <Icon size={18} className={tk.headerText} aria-hidden="true" />
          <h2 id={titleId} className={`font-extrabold text-base ${tk.headerText}`}>
            {title}
          </h2>
        </div>
        <span
          className={`text-sm font-extrabold px-3 py-1 rounded-full ${tk.countBg} ${tk.countText}`}
          aria-label={`${alquileres.length} ítems en total`}
        >
          {alquileres.length}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="bg-white border-2 border-t-0 border-gray-100 rounded-b-2xl overflow-hidden">
        {alquileres.length === 0 ? (
          <p className="text-center text-sm text-gray-400 font-medium py-8 px-5">{emptyText}</p>
        ) : (
          <ul className="divide-y-2 divide-gray-50" role="list">
            {alquileres.map((a) => (
              <li
                key={a.id}
                className={`px-5 py-4 border-l-4 ${tk.cardBorder} focus-visible:bg-gray-50 outline-none`}
                tabIndex={0}
                aria-label={`Equipo: ${a.equipo}. Cliente: ${a.cliente}.`}
              >
                <div aria-hidden="true">
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tk.iconBg}`}>
                      <Package size={17} className={tk.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-snug">{a.equipo}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <User size={12} className="text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{a.cliente}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${tk.badgeBg} ${tk.badgeText}`}>
                    <ArrowRight size={11} />
                    {renderExtra(a)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DateRange({ label, fecha }: { label: string; fecha: string }) {
  return <span>{label} {fecha}</span>;
}