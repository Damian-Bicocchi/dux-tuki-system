import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  List,
  Calendar,
  Package,
  Users,
  BarChart3,
  ChevronRight,
  LogOut,
  Icon,
} from "lucide-react";

interface Stats {
  activos: number;
  vencidos: number;
  total_clientes: number;
  ingresos_mes: number;
}

interface HomePageProps {
  onLogout?: () => void;
  userName?: string;
}

export default function HomePage({ onLogout, userName }: HomePageProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    activos: 12,
    vencidos: 3,
    total_clientes: 48,
    ingresos_mes: 245000,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        activos: 12,
        vencidos: 1,
        total_clientes: 48,
        ingresos_mes: 245000,
      });
      setStatsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Foco automático al abrir el diálogo de confirmación
  useEffect(() => {
    if (showLogoutConfirm && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [showLogoutConfirm]);

  // Cerrar diálogo con Escape
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString("es-AR")}`;
  };

 const handleLogoutConfirm = () => {
  setShowLogoutConfirm(false);
  if (onLogout) {
    onLogout();
  } else {
    navigate("/", { replace: true });
  }
};

  const actions = [
    {
      icon: Plus,
      title: "Nuevo Alquiler",
      subtitle: "Registrá un alquiler nuevo",
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
      path: "/app/nuevo-alquiler",
    },
    {
      icon: List,
      title: "Ver Alquileres",
      subtitle: "Listado con filtros y estados",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      path: "/app/alquileres",
    },
    {
      icon: Calendar,
      title: "Calendario",
      subtitle: "Vista de alquileres por fecha",
      color: "bg-pink-50",
      iconColor: "text-pink-600",
      path: "/app/calendario",
    },
    {
      icon: Package,
      title: "Stock",
      subtitle: "Inventario y disponibilidad",
      color: "bg-amber-50",
      iconColor: "text-amber-600",
      path: "/app/stock",
    },
    {
      icon: Users,
      title: "Clientes",
      subtitle: "Base de clientes completa",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      path: "/app/clientes",
    },
    {
      icon: BarChart3,
      title: "Estadísticas",
      subtitle: "ROI, ganancias y análisis",
      color: "bg-green-50",
      iconColor: "text-green-600",
      path: "/app/estadisticas",
    },
    {
      icon: Users,
      title: "Sistema",
      subtitle: "Opciones de configuración del sistema",
      color: "bg-purple-50",
      iconColor: "text-green-600",
      path: "/app/sistema",
    },
  ];

  return (
    <>
      {/* Live region para anuncios dinámicos */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statsLoaded &&
          stats.vencidos > 0 &&
          `Atención: ${stats.vencidos} alquileres vencidos`}
      </div>

      {/* ── Header con saludo y botón de cerrar sesión ── */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#218a72] uppercase tracking-wider mb-0.5">
            Bienvenido/a
          </p>
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {userName ?? "Panel principal"}
          </h1>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="
            flex items-center gap-2 px-4 py-2.5
            rounded-xl border-2 border-gray-200
            bg-white text-gray-700
            text-sm font-semibold
            hover:border-red-300 hover:text-red-700 hover:bg-red-50
            focus:outline-none focus:ring-4 focus:ring-red-200
            active:scale-95
            transition-all flex-shrink-0
          "
          aria-label="Cerrar sesión"
        >
          <LogOut
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      {/* KPIs */}
      <section className="px-5 pt-2 pb-5">
        <h2 className="sr-only">Indicadores principales</h2>
        <div className="grid grid-cols-2 gap-3" role="list">
          {/* Activos */}
          <div
            className="bg-white rounded-2xl shadow-sm p-4 border-2 border-gray-100 overflow-hidden"
            role="listitem"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0 text-base"
                aria-hidden="true"
              >
                ✓
              </div>
              <div
                className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate"
                id="activos-label"
              >
                Activos
              </div>
            </div>
            <div
              className="kpi-number font-extrabold text-gray-900 truncate"
              aria-labelledby="activos-label"
            >
              {stats.activos}
            </div>
          </div>

          {/* Vencidos */}
          <div
            className="bg-white rounded-2xl shadow-sm p-4 border-2 border-gray-100 overflow-hidden"
            role="listitem"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-700 font-bold flex-shrink-0 text-base"
                aria-hidden="true"
              >
                !
              </div>
              <div
                className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate"
                id="vencidos-label"
              >
                Vencidos
              </div>
            </div>
            <div
              className="kpi-number font-extrabold text-gray-900 truncate"
              aria-labelledby="vencidos-label"
            >
              {stats.vencidos}
            </div>
          </div>

          {/* Clientes */}
          <div
            className="bg-white rounded-2xl shadow-sm p-4 border-2 border-gray-100 overflow-hidden"
            role="listitem"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 text-base"
                aria-hidden="true"
              >
                👥
              </div>
              <div
                className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate"
                id="clientes-label"
              >
                Clientes
              </div>
            </div>
            <div
              className="kpi-number font-extrabold text-gray-900 truncate"
              aria-labelledby="clientes-label"
            >
              {stats.total_clientes}
            </div>
          </div>

          {/* Ingresos del mes */}
          <div
            className="bg-white rounded-2xl shadow-sm p-4 border-2 border-gray-100 overflow-hidden"
            role="listitem"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-bold flex-shrink-0 text-base"
                aria-hidden="true"
              >
                $
              </div>
              <div
                className="text-xs font-bold text-gray-600 uppercase tracking-wider break-words leading-tight"
                id="ingresos-label"
              >
                Ingresos del mes
              </div>
            </div>
            <div
              className="kpi-number-large font-extrabold text-gray-900 truncate"
              aria-labelledby="ingresos-label"
              title={formatMoney(stats.ingresos_mes)}
            >
              {formatMoney(stats.ingresos_mes)}
            </div>
          </div>
        </div>
      </section>
      

      {/* Alerta vencidos */}
      {stats.vencidos > 0 && (
        <section className="px-5 pb-6" aria-labelledby="alerta-vencidos">
          <div
            className="bg-red-50 border-2 border-red-300 rounded-2xl p-5"
            role="alert"
          >
            <div className="flex items-start gap-3.5">
              <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
                ⚠️
              </span>
              <div className="flex-1 min-w-0">
                <h3
                  id="alerta-vencidos"
                  className="font-bold text-red-900 mb-2 text-base"
                >
                  Alquileres vencidos
                </h3>
                <p className="text-sm text-red-800 leading-relaxed">
                  Hay <strong>{stats.vencidos}</strong>{" "}
                  alquiler(es) sin devolver y fuera de fecha.
                </p>
                <button
                  onClick={() => navigate("/app/alquileres?filter=vencido")}
                  className="mt-4 w-full bg-red-700 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-red-800 focus:bg-red-800 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-red-300"
                  aria-label={`Revisar ${stats.vencidos} alquileres vencidos`}
                >
                  Revisar ahora
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Acciones */}
      <section className="px-5 pb-28" aria-labelledby="acciones-titulo">
        <div className="mb-5">
          <div className="text-xs font-bold text-[#218a72] uppercase tracking-wider mb-1.5">
            Panel
          </div>
          <h2 id="acciones-titulo" className="text-xl font-bold text-gray-900">
            Acciones rápidas
          </h2>
        </div>

        <nav className="space-y-3" aria-label="Acciones principales">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="w-full text-left bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-100 hover:border-[#218a72] focus:border-[#218a72] active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0`}
                  aria-hidden="true"
                >
                  <action.icon size={26} className={action.iconColor} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 mb-1 text-base">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-600 leading-snug">
                    {action.subtitle}
                  </div>
                </div>
                <ChevronRight
                  size={22}
                  className="text-gray-400 flex-shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </nav>
      </section>

      {/* CTA flotante */}
      <button
        onClick={() => navigate("/app/nuevo-alquiler")}
        className="fixed bottom-8 right-6 bg-[#f5e663] text-[#1b6f5c] rounded-full shadow-xl flex items-center justify-center gap-2 px-6 py-4 hover:scale-105 focus:scale-105 active:scale-95 transition-transform z-30 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#f5e663]/50"
        aria-label="Crear nuevo alquiler"
      >
        <Plus size={24} strokeWidth={2.5} />
        <span className="font-bold text-base">Nuevo alquiler</span>
      </button>

      {/* ── Diálogo de confirmación de cierre de sesión ── */}
      {showLogoutConfirm && (
        <>
          {/* Overlay — captura foco y clics fuera */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />

          {/* Panel modal */}
          <div
            ref={confirmDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-desc"
            className="fixed inset-x-4 bottom-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-50 p-6 pb-10 sm:pb-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            {/* Ícono */}
            <div
              className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"
              aria-hidden="true"
            >
              <LogOut size={28} className="text-red-600" strokeWidth={2} />
            </div>

            <h2
              id="logout-dialog-title"
              className="text-xl font-bold text-gray-900 text-center mb-2"
            >
              ¿Cerrar sesión?
            </h2>
            <p
              id="logout-dialog-desc"
              className="text-sm text-gray-600 text-center leading-relaxed mb-6"
            >
              Vas a salir de la aplicación. Podés volver a ingresar cuando quieras.
            </p>

            <div className="flex flex-col gap-3">
              {/* Confirmar — acción destructiva, va primero en el DOM pero visualmente secundario */}
              <button
                onClick={handleLogoutConfirm}
                className="w-full py-4 px-4 rounded-xl bg-red-600 text-white font-semibold text-base hover:bg-red-700 focus:bg-red-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                Sí, cerrar sesión
              </button>

              {/* Cancelar — foco inicial para evitar acción accidental */}
              <button
                ref={cancelButtonRef}
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-semibold text-base hover:bg-gray-50 focus:bg-gray-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}