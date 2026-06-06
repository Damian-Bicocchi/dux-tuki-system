import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Menu,
  X,
  Plus,
  Settings,
  Bell,
  Search,
  Home,
  List,
  Calendar,
  Package,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import SettingsPanel, {
  AccessibilitySettings,
} from "../components/SettingsPanel";
import NotificationsPanel from "../components/NotificationsPanel";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: "normal",
  contrast: "normal",
  spacing: "normal",
  reduceMotion: false,
  colorBlindMode: false,
};

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(4);
  const [settings, setSettings] =
    useState<AccessibilitySettings>(() => {
      const saved = localStorage.getItem(
        "tuki-accessibility-settings",
      );
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Persistir configuraciones de accesibilidad
  useEffect(() => {
    localStorage.setItem(
      "tuki-accessibility-settings",
      JSON.stringify(settings),
    );

    const root = document.documentElement;
    const fontSizes = {
      small: "14px",
      normal: "16px",
      large: "18px",
      xlarge: "20px",
    };
    root.style.setProperty(
      "--font-size",
      fontSizes[settings.fontSize],
    );

    if (settings.contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    root.setAttribute("data-spacing", settings.spacing);

    if (settings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (settings.colorBlindMode) {
      root.classList.add("color-blind-mode");
    } else {
      root.classList.remove("color-blind-mode");
    }
  }, [settings]);

  const handleSettingsChange = (
    newSettings: AccessibilitySettings,
  ) => {
    setSettings(newSettings);
  };

  const handleUnreadCountChange = useCallback(
    (count: number) => {
      setUnreadCount(count);
    },
    [],
  );

  // Anunciar apertura del modal y enfocar
  useEffect(() => {
    if (showLogoutConfirm) {
      setLiveMessage("Diálogo de confirmación de cierre de sesión abierto");
      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
        setLiveMessage("");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showLogoutConfirm]);

  // Cerrar diálogo con Escape
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLogoutConfirm(false);
        setLiveMessage("Diálogo cancelado");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  // Trapeo de foco dentro del modal
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = [confirmButtonRef.current, cancelButtonRef.current].filter(Boolean);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [showLogoutConfirm]);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setLiveMessage("Cerrando sesión");
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 100);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
    setLiveMessage("Acción cancelada");
  };

  const menuItems = [
    { icon: Home, title: "Inicio", path: "/app/" },
    {
      icon: Plus,
      title: "Nuevo Alquiler",
      path: "/app/nuevo-alquiler",
    },
    {
      icon: List,
      title: "Ver Alquileres",
      path: "/app//alquileres",
    },
    {
      icon: Calendar,
      title: "Calendario de vencimiento",
      path: "/app//calendario",
    },
    { icon: Package, title: "Stock", path: "/app//stock" },
    { icon: Users, title: "Clientes", path: "/app//clientes" },
    {
      icon: BarChart3,
      title: "Estadísticas",
      path: "/app//estadisticas",
    },
  ];

  const currentPage = menuItems.find(
    (item) => item.path === location.pathname,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-gray-900 focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      {/* Región live para anuncios dinámicos */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      {/* Header */}
      <header
        role="banner"
        className="bg-gradient-to-br from-[#29a285] via-[#218a72] to-[#1b6f5c] text-white sticky top-0 z-40 shadow-md"
      >
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-3 -ml-2 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label={
                  menuOpen ? "Cerrar menú" : "Abrir menú"
                }
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {menuOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>
              <div>
                <div className="text-xs font-semibold opacity-80 tracking-wider">
                  TUKI SYSTEM
                </div>
                <h1 className="text-xl font-bold">
                  {currentPage?.title || "Inicio"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label="Configuración de accesibilidad"
              >
                <Settings size={22} aria-hidden="true" />
                <span className="text-[11px] font-medium opacity-90 leading-none">Accesibilidad</span>
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 hover:bg-white/10 rounded-xl transition-colors relative focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label={
                  unreadCount > 0
                    ? `Notificaciones, ${unreadCount} sin leer`
                    : "Notificaciones, sin notificaciones nuevas"
                }
                aria-haspopup="dialog"
              >
                <span className="relative">
                  <Bell size={22} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-[#f5e663] text-[#1b6f5c] rounded-full flex items-center justify-center px-0.5 border-2 border-[#218a72]"
                      aria-hidden="true"
                    >
                      <span className="text-[9px] font-extrabold leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium opacity-90 leading-none">Notificaciones</span>
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label="Cerrar sesión"
                aria-haspopup="dialog"
                aria-expanded={showLogoutConfirm}
              >
                <LogOut size={22} aria-hidden="true" />
                <span className="text-[11px] font-medium opacity-90 leading-none">Cerrar sesión</span>
              </button>
              {/*
              <button
                className="p-3 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label="Buscar"
              >
                <Search size={22} />
              </button>
                */}
            </div>
          </div>
        </div>

        {/* Menu móvil */}
        {menuOpen && (
          <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
            <nav
              id="mobile-menu"
              className="px-5 py-4 space-y-1"
              aria-label="Menú principal"
            >
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                      isActive
                        ? "bg-white/20"
                        : "hover:bg-white/10 focus:bg-white/10"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`${item.title}${isActive ? ", página actual" : ""}`}
                  >
                    <item.icon
                      size={20}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-medium">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main id="main-content">
        <Outlet />
      </main>

      {/* Panel de configuración */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Panel de notificaciones */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />

      {/* Diálogo de confirmación de cierre de sesión */}
      {showLogoutConfirm && (
        <>
          {/* Overlay — captura foco y clics fuera */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleLogoutCancel}
            aria-hidden="true"
            role="presentation"
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
              <LogOut
                size={28}
                className="text-red-600"
                strokeWidth={2}
              />
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
              Vas a salir de la aplicación. Podés volver a
              ingresar cuando quieras.
            </p>

            <div className="flex flex-col gap-3" role="group" aria-label="Acciones de confirmación">
              {/* Confirmar — acción destructiva, va primero en el DOM pero visualmente secundario */}
              <button
                ref={confirmButtonRef}
                onClick={handleLogoutConfirm}
                className="w-full py-4 px-4 rounded-xl bg-red-600 text-white font-semibold text-base hover:bg-red-700 focus:bg-red-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
                aria-label="Confirmar y cerrar sesión ahora"
              >
                Sí, cerrar sesión
              </button>

              {/* Cancelar — foco inicial para evitar acción accidental */}
              <button
                ref={cancelButtonRef}
                onClick={handleLogoutCancel}
                className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-semibold text-base hover:bg-gray-50 focus:bg-gray-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
                aria-label="Cancelar y permanecer en la aplicación"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}