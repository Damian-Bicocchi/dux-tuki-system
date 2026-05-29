import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Package } from 'lucide-react';

interface Alquiler {
  id: number;
  cliente: string;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'en_fecha' | 'vencido' | 'entregado_fuera_termino' | 'entregado_en_termino';
}

// Paleta de tokens por estado — fills suaves, texto oscuro del mismo ramp
const STATUS_TOKENS = {
  en_fecha: {
    bg: '#E1F5EE',        // teal-50
    border: '#5DCAA5',    // teal-200
    text: '#085041',      // teal-800
    dot: '#1D9E75',       // teal-400
    badgeBg: '#9FE1CB',   // teal-100
  },
  vence_hoy: {
    bg: '#FAEEDA',        // amber-50
    border: '#EF9F27',    // amber-200
    text: '#633806',      // amber-800
    dot: '#BA7517',       // amber-400
    badgeBg: '#FAC775',   // amber-100
  },
  vencido: {
    bg: '#FCEBEB',        // red-50
    border: '#F09595',    // red-200
    text: '#791F1F',      // red-800
    dot: '#E24B4A',       // red-400
    badgeBg: '#F7C1C1',   // red-100
  },
  entregado_fuera_termino: {
  bg: '#EEEDFE',        // purple-50
  border: '#AFA9EC',    // purple-200
  text: '#3C3489',      // purple-800
  dot: '#7F77DD',       // purple-400
  badgeBg: '#CECBF6',   // purple-100
  },
  entregado_en_termino: {
    bg: '#EAF3DE',        // green-50
    border: '#97C459',    // green-200
    text: '#27500A',      // green-800
    dot: '#639922',       // green-400
    badgeBg: '#C0DD97',   // green-100
  },
} as const;

type TokenKey = keyof typeof STATUS_TOKENS;

function getTokenKey(alq: Alquiler, dateStr: string): TokenKey {
  if (alq.estado === 'en_fecha') {
    if (dateStr < alq.fechaFin)  return 'en_fecha';
    if (dateStr === alq.fechaFin) return 'vence_hoy';
    return 'vencido';
  }
  if (alq.estado === 'vencido') return 'vencido';
  if (alq.estado === 'entregado_fuera_termino') return 'entregado_fuera_termino';
  return 'entregado_en_termino';
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case 'en_fecha':                return 'En fecha';
    case 'vencido':                 return 'Vencido';
    case 'entregado_fuera_termino': return 'Fuera de término';
    case 'entregado_en_termino':    return 'En término';
    default:                        return estado;
  }
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 10));
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

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
  const nextMonth    = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setSelectedDay(null); };

  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const weekDays  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const referencias = [
    { key: 'en_fecha'               as TokenKey, label: 'En fecha (activo)' },
    { key: 'vence_hoy'              as TokenKey, label: 'Vence hoy' },
    { key: 'vencido'                as TokenKey, label: 'Vencido sin devolver' },
    { key: 'entregado_fuera_termino' as TokenKey, label: 'Entregado fuera de término' },
    { key: 'entregado_en_termino'   as TokenKey, label: 'Entregado en término' },
  ];

  const selectedDayAlquileres = selectedDay ? getAlquileresForDay(selectedDay) : [];
  const ACCENT = '#1D9E75'; // teal-400 — color principal de la UI

  return (
    <div className="px-4 md:px-8 lg:px-12 py-6 md:py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl p-4 md:p-6" style={{ background: ACCENT }}>
        <button onClick={previousMonth} className="p-2 md:p-3 rounded-xl transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Mes anterior">
          <ChevronLeft size={22} className="text-white md:hidden" />
          <ChevronLeft size={30} className="text-white hidden md:block" />
        </button>
        <h1 className="font-bold text-xl md:text-3xl lg:text-4xl text-white capitalize tracking-wide">{monthName}</h1>
        <button onClick={nextMonth} className="p-2 md:p-3 rounded-xl transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Mes siguiente">
          <ChevronRight size={22} className="text-white md:hidden" />
          <ChevronRight size={30} className="text-white hidden md:block" />
        </button>
      </div>

      {/* Calendario + Referencias */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">

        {/* Grilla */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl p-2 md:p-4 lg:p-5 border border-gray-100">

          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-3">
            {weekDays.map(day => (
              <div key={day} className="text-center py-1 md:py-2">
                <span className="md:hidden text-[10px] font-bold" style={{ color: ACCENT }}>{day.charAt(0)}</span>
                <span className="hidden md:inline text-sm lg:text-base font-bold" style={{ color: ACCENT }}>{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[48px] md:min-h-[90px] lg:min-h-[110px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = makeDateStr(day);
              const dayAlquileres = getAlquileresForDay(day);
              const today = isToday(day);
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="min-h-[48px] md:min-h-[90px] lg:min-h-[110px] w-full rounded-xl md:rounded-2xl p-1 md:p-2 lg:p-2.5 flex flex-col items-center md:items-start justify-start focus:outline-none transition-all"
                  style={{
                    border: isSelected
                      ? `2px solid ${ACCENT}`
                      : today
                      ? `1.5px solid ${ACCENT}`
                      : '1px solid #e5e7eb',
                    background: isSelected ? '#E1F5EE' : today ? '#f0fdf8' : '#fafafa',
                  }}
                  aria-label={`Día ${day}, ${dayAlquileres.length} alquileres`}
                  aria-pressed={isSelected}
                >
                  {/* Número del día */}
                  <div className="text-xs md:text-base lg:text-lg font-bold text-center md:text-left leading-none mb-1 md:mb-2"
                    style={{ color: today || isSelected ? ACCENT : '#374151' }}>
                    {today
                      ? <span className="hidden md:flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full text-white text-sm" style={{ background: ACCENT }}>{day}</span>
                      : day}
                    {today && <span className="md:hidden">{day}</span>}
                  </div>

                  {/* Indicadores */}
                  {dayAlquileres.length > 0 && (
                    <>
                      {/* Mobile: puntos */}
                      <div className="flex gap-0.5 justify-center flex-wrap md:hidden">
                        {dayAlquileres.slice(0, 2).map(alq => {
                          const tk = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                          return <div key={alq.id} className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tk.dot }} title={alq.equipo} />;
                        })}
                        {dayAlquileres.length > 2 && (
                          <span className="font-bold leading-none" style={{ fontSize: '9px', color: ACCENT }}>+{dayAlquileres.length - 2}</span>
                        )}
                      </div>

                      {/* Desktop: badges */}
                      <div className="hidden md:flex flex-col gap-1 w-full">
                        {dayAlquileres.slice(0, 2).map(alq => {
                          const tk = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                          return (
                            <div
                              key={alq.id}
                              className="text-[11px] lg:text-xs font-semibold leading-tight py-0.5 px-1.5 rounded-md w-full truncate"
                              style={{ background: tk.bg, color: tk.text, border: `1px solid ${tk.border}` }}
                              title={alq.equipo}
                            >
                              {alq.equipo}
                            </div>
                          );
                        })}
                        {dayAlquileres.length > 2 && (
                          <div className="text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded-full w-fit" style={{ color: ACCENT, background: '#E1F5EE' }}>
                            +{dayAlquileres.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Referencias */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 md:w-56 lg:w-64 md:flex-shrink-0">
          <h2 className="font-bold text-sm md:text-base text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <div className="w-1 h-4 md:h-5 rounded-full flex-shrink-0" style={{ background: ACCENT }}></div>
            Referencias
          </h2>

          <div className="grid grid-cols-2 gap-2 md:hidden">
            {referencias.map(ref => {
              const tk = STATUS_TOKENS[ref.key];
              return (
                <div key={ref.key} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl" style={{ background: tk.bg, border: `1.5px solid ${tk.border}` }}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: tk.dot }} />
                  <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: tk.text }}>{ref.label}</span>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex flex-col gap-2">
            {referencias.map(ref => {
              const tk = STATUS_TOKENS[ref.key];
              return (
                <div key={ref.key} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: tk.bg, border: `1px solid ${tk.border}` }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tk.dot }} />
                  <span className="text-xs font-medium leading-tight" style={{ color: tk.text }}>{ref.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalle del día */}
      {selectedDay && (
        <div className="rounded-2xl p-6 md:p-8" style={{ background: '#E1F5EE', border: `1.5px solid #9FE1CB` }}>
          <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: `1px solid #9FE1CB` }}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ background: '#9FE1CB' }}>
              <Calendar style={{ color: '#085041' }} size={20} />
            </div>
            <h2 className="font-bold text-lg md:text-2xl" style={{ color: '#085041' }}>
              {selectedDay} de {monthName}
            </h2>
          </div>

          {selectedDayAlquileres.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {selectedDayAlquileres.map(alq => {
                const dateStr = makeDateStr(selectedDay);
                const tk = STATUS_TOKENS[getTokenKey(alq, dateStr)];
                return (
                  <div key={alq.id} className="p-4 md:p-5 rounded-xl bg-white flex flex-col gap-3" style={{ border: `1px solid #9FE1CB` }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-base" style={{ color: '#085041' }}>Alquiler #{alq.id}</span>
                      <span className="text-[10px] md:text-xs font-semibold px-2 py-1 rounded-lg leading-tight" style={{ background: tk.badgeBg, color: tk.text, border: `1px solid ${tk.border}` }}>
                        {getEstadoLabel(alq.estado)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg" style={{ background: '#f9fafb' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.badgeBg }}>
                        <Package size={15} style={{ color: tk.text }} />
                      </div>
                      <span className="font-medium truncate" style={{ color: '#374151' }}>{alq.equipo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg" style={{ background: '#f9fafb' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E1F5EE' }}>
                        <User size={15} style={{ color: ACCENT }} />
                      </div>
                      <span className="truncate" style={{ color: '#6b7280' }}>{alq.cliente}</span>
                    </div>
                    <div className="text-xs px-1" style={{ color: '#9ca3af' }}>
                      {alq.fechaInicio.split('-').reverse().join('-')} → {alq.fechaFin.split('-').reverse().join('-')}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 rounded-xl" style={{ background: '#9FE1CB33', border: `1px solid #9FE1CB` }}>
              <p className="font-medium md:text-lg" style={{ color: '#085041' }}>No hay alquileres para esta fecha.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}