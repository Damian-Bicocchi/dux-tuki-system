import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Alquiler {
  id: number;
  cliente: string;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'en_fecha' | 'vencido' | 'entregado_fuera_termino' | 'entregado_en_termino';
}

const STATUS_TOKENS = {
  en_fecha: {
    bg: '#E1F5EE', border: '#5DCAA5', text: '#085041', dot: '#1D9E75', badgeBg: '#9FE1CB',
    label: 'En fecha',
    Icon: Clock,
  },
  vence_hoy: {
    bg: '#FAEEDA', border: '#EF9F27', text: '#633806', dot: '#BA7517', badgeBg: '#FAC775',
    label: 'Vence hoy',
    Icon: AlertTriangle,
  },
  vencido: {
    bg: '#FCEBEB', border: '#F09595', text: '#791F1F', dot: '#E24B4A', badgeBg: '#F7C1C1',
    label: 'Vencido',
    Icon: AlertTriangle,
  },
  entregado_fuera_termino: {
    bg: '#EEEDFE', border: '#AFA9EC', text: '#3C3489', dot: '#7F77DD', badgeBg: '#CECBF6',
    label: 'Entregado fuera de término',
    Icon: CheckCircle,
  },
  entregado_en_termino: {
    bg: '#EAF3DE', border: '#97C459', text: '#27500A', dot: '#639922', badgeBg: '#C0DD97',
    label: 'Entregado en término',
    Icon: CheckCircle,
  },
} as const;

type TokenKey = keyof typeof STATUS_TOKENS;

function getTokenKey(alq: Alquiler, dateStr: string): TokenKey {
  if (alq.estado === 'en_fecha') {
    if (dateStr < alq.fechaFin) return 'en_fecha';
    if (dateStr === alq.fechaFin) return 'vence_hoy';
    return 'vencido';
  }
  if (alq.estado === 'vencido') return 'vencido';
  if (alq.estado === 'entregado_fuera_termino') return 'entregado_fuera_termino';
  return 'entregado_en_termino';
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case 'en_fecha': return 'En fecha';
    case 'vencido': return 'Vencido';
    case 'entregado_fuera_termino': return 'Fuera de término';
    case 'entregado_en_termino': return 'En término';
    default: return estado;
  }
}

const ACCENT = '#1D9E75';
const WEEK_DAYS_FULL  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const WEEK_DAYS_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const alquileres: Alquiler[] = [
    { id: 1, cliente: 'Juan Pérez',     equipo: 'Cámara Sony A7 III',  fechaInicio: '2026-05-01', fechaFin: '2026-05-05', estado: 'entregado_en_termino' },
    { id: 2, cliente: 'María González', equipo: 'Micrófono Rode NTG3', fechaInicio: '2026-04-25', fechaFin: '2026-05-01', estado: 'vencido' },
    { id: 3, cliente: 'Carlos López',   equipo: 'Kit de luces LED',    fechaInicio: '2026-05-02', fechaFin: '2026-05-08', estado: 'entregado_fuera_termino' },
    { id: 4, cliente: 'Ana Martínez',   equipo: 'Trípode Manfrotto',   fechaInicio: '2026-04-28', fechaFin: '2026-04-30', estado: 'entregado_en_termino' },
    { id: 5, cliente: 'Pedro Ruiz',     equipo: 'Cámara Canon 5D',     fechaInicio: '2026-05-10', fechaFin: '2026-05-15', estado: 'en_fecha' },
    { id: 6, cliente: 'Laura Torres',   equipo: 'Luces LED',           fechaInicio: '2026-05-12', fechaFin: '2026-05-18', estado: 'en_fecha' },
    { id: 7, cliente: 'Diego Sosa',     equipo: 'Grabadora Zoom H6',   fechaInicio: '2026-05-07', fechaFin: '2026-05-11', estado: 'en_fecha' },
    { id: 8, cliente: 'Sofía Blanco',   equipo: 'Lente 50mm f/1.4',    fechaInicio: '2026-05-14', fechaFin: '2026-05-20', estado: 'en_fecha' },
  ];

  const getDaysInMonth = (date: Date) => ({
    daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    startingDayOfWeek: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
  });

  const makeDateStr = (day: number) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getAlquileresForDay = (day: number) => {
    const dateStr = makeDateStr(day);
    return alquileres.filter(alq => {
      if (dateStr < alq.fechaInicio) return false;
      if (alq.estado === 'en_fecha') return true;
      return dateStr <= alq.fechaFin;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const previousMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setSelectedDay(null); };
  const nextMonth     = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setSelectedDay(null); };
  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const selectedDayAlquileres = selectedDay ? getAlquileresForDay(selectedDay) : [];

  const legendItems: { key: TokenKey }[] = [
    { key: 'en_fecha' },
    { key: 'vence_hoy' },
    { key: 'vencido' },
    { key: 'entregado_fuera_termino' },
    { key: 'entregado_en_termino' },
  ];

  return (
    <div className="px-4 md:px-6 py-5 space-y-4 max-w-4xl mx-auto">

      {/* Navegación de mes */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3 md:px-6 md:py-4"
        style={{ background: ACCENT }}
        role="navigation"
        aria-label="Navegación de mes"
      >
        <button
          onClick={previousMonth}
          className="p-2 rounded-xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={24} className="text-white" aria-hidden="true" />
        </button>
        <h1
          className="text-xl md:text-2xl font-bold text-white capitalize tracking-wide"
          aria-live="polite"
          aria-atomic="true"
        >
          {monthName}
        </h1>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={24} className="text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Leyenda horizontal con íconos */}
      <div
        className="bg-white rounded-2xl px-4 py-3 border border-gray-100"
        role="region"
        aria-label="Referencias de estado"
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Referencias
        </p>
        <div className="flex flex-wrap gap-2" role="list">
          {legendItems.map(({ key }) => {
            const tk = STATUS_TOKENS[key];
            const Icon = tk.Icon;
            return (
              <div
                key={key}
                role="listitem"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: tk.bg, border: `1.5px solid ${tk.border}`, color: tk.text }}
                aria-label={tk.label}
              >
                <Icon
                  size={13}
                  aria-hidden="true"
                  style={{ color: tk.dot }}
                  strokeWidth={2.5}
                />
                {tk.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grilla del calendario */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        role="grid"
        aria-label={`Calendario de alquileres — ${monthName}`}
      >
        {/* Encabezados días de semana */}
        <div role="row" className="grid grid-cols-7 border-b border-gray-100">
          {WEEK_DAYS_FULL.map((day, i) => (
            <div key={day} role="columnheader" className="py-2.5 text-center">
              <span className="md:hidden text-xs font-bold" style={{ color: ACCENT }} aria-hidden="true">
                {WEEK_DAYS_SHORT[i]}
              </span>
              <span className="hidden md:inline text-sm font-bold" style={{ color: ACCENT }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Días */}
        <div role="row" className="grid grid-cols-7">
          {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} role="gridcell" aria-hidden="true" className="border-r border-b border-gray-50 min-h-[60px] md:min-h-[96px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day        = idx + 1;
            const dateStr    = makeDateStr(day);
            const dayAlqs    = getAlquileresForDay(day);
            const today      = isToday(day);
            const isSelected = selectedDay === day;
            const isLastCol  = (startingDayOfWeek + idx) % 7 === 6;
            const hasAlqs    = dayAlqs.length > 0;

            return (
              <div
                key={day}
                role="gridcell"
                aria-selected={isSelected}
                className={`border-b border-gray-100 ${isLastCol ? '' : 'border-r'}`}
              >
                <button
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className="w-full min-h-[60px] md:min-h-[96px] p-1.5 md:p-2.5 flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-inset transition-colors"
                  style={{
                    background: isSelected ? '#E1F5EE' : today ? '#F0FDF8' : 'transparent',
                  }}
                  aria-label={`${today ? 'Hoy, ' : ''}${day} de ${monthName}${hasAlqs ? `, ${dayAlqs.length} alquiler${dayAlqs.length !== 1 ? 'es' : ''}` : ''}`}
                  aria-pressed={isSelected}
                >
                  {/* Número del día */}
                  <div className="flex justify-center md:justify-start">
                    <span
                      className="text-sm md:text-base font-bold leading-none flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full transition-colors"
                      style={
                        today
                          ? { background: ACCENT, color: '#fff' }
                          : isSelected
                          ? { background: '#9FE1CB', color: '#085041' }
                          : { color: '#374151' }
                      }
                    >
                      {day}
                    </span>
                  </div>

                  {/* Indicadores */}
                  {hasAlqs && (
                    <>
                      {/* Móvil: puntos */}
                      <div className="flex justify-center gap-0.5 flex-wrap md:hidden">
                        {dayAlqs.slice(0, 3).map(alq => {
                          const tk = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                          return <span key={alq.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tk.dot }} aria-hidden="true" />;
                        })}
                        {dayAlqs.length > 3 && (
                          <span className="text-[9px] font-bold leading-none" style={{ color: ACCENT }} aria-hidden="true">+{dayAlqs.length - 3}</span>
                        )}
                      </div>

                      {/* Desktop: píldoras con ícono y texto */}
                      <div className="hidden md:flex flex-col gap-1 w-full">
                        {dayAlqs.slice(0, 2).map(alq => {
                          const tk  = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                          const Icon = tk.Icon;
                          return (
                            <span
                              key={alq.id}
                              className="flex items-center gap-1 text-[11px] font-semibold leading-tight px-1.5 py-0.5 rounded-md truncate"
                              style={{ background: tk.bg, color: tk.text, border: `1px solid ${tk.border}` }}
                              title={alq.equipo}
                              aria-hidden="true"
                            >
                              <Icon size={10} strokeWidth={2.5} style={{ color: tk.dot, flexShrink: 0 }} />
                              <span className="truncate">{alq.equipo}</span>
                            </span>
                          );
                        })}
                        {dayAlqs.length > 2 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit" style={{ color: ACCENT, background: '#E1F5EE' }} aria-hidden="true">
                            +{dayAlqs.length - 2} más
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del día */}
      <div aria-live="polite" aria-atomic="true">
        {selectedDay && (
          <section
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: '#9FE1CB' }}
            aria-labelledby="detalle-dia-titulo"
          >
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: ACCENT }}>
              <Calendar size={20} className="text-white flex-shrink-0" aria-hidden="true" />
              <h2 id="detalle-dia-titulo" className="font-bold text-lg text-white capitalize">
                {selectedDay} de {monthName}
              </h2>
              {selectedDayAlquileres.length > 0 && (
                <span className="ml-auto text-sm font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {selectedDayAlquileres.length} alquiler{selectedDayAlquileres.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            <div className="p-4 md:p-5" style={{ background: '#F0FDF8' }}>
              {selectedDayAlquileres.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" role="list" aria-label={`Alquileres del ${selectedDay} de ${monthName}`}>
                  {selectedDayAlquileres.map(alq => {
                    const dateStr        = makeDateStr(selectedDay);
                    const tk             = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                    const Icon           = tk.Icon;
                    const fechaInicioFmt = alq.fechaInicio.split('-').reverse().join('/');
                    const fechaFinFmt    = alq.fechaFin.split('-').reverse().join('/');

                    return (
                      <li
                        key={alq.id}
                        className="bg-white rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                        style={{ border: `1.5px solid ${tk.border}` }}
                        aria-label={`Alquiler ${alq.id}: ${alq.equipo}, cliente ${alq.cliente}, ${getEstadoLabel(alq.estado)}, del ${fechaInicioFmt} al ${fechaFinFmt}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-400">#{alq.id}</span>
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: tk.badgeBg, color: tk.text }}
                            aria-hidden="true"
                          >
                            <Icon size={11} strokeWidth={2.5} style={{ color: tk.dot }} aria-hidden="true" />
                            {getEstadoLabel(alq.estado)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tk.bg }} aria-hidden="true">
                            <Package size={15} style={{ color: tk.dot }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 leading-tight">{alq.equipo}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F3F4F6' }} aria-hidden="true">
                            <User size={15} className="text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600 truncate">{alq.cliente}</span>
                        </div>

                        <div className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ background: tk.bg, color: tk.text }}>
                          {fechaInicioFmt} → {fechaFinFmt}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm font-medium text-gray-500">No hay alquileres para este día.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}