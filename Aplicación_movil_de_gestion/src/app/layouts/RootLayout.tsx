import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Menu, X, Plus, Settings, Bell, Search, Home, List, Calendar, Package, Users, BarChart3 } from 'lucide-react';
import SettingsPanel, { AccessibilitySettings } from '../components/SettingsPanel';
import NotificationsPanel from '../components/NotificationsPanel';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  spacing: 'normal',
  reduceMotion: false,
  colorBlindMode: false
};

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('tuki-accessibility-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Persistir configuraciones de accesibilidad
  useEffect(() => {
    localStorage.setItem('tuki-accessibility-settings', JSON.stringify(settings));

    const root = document.documentElement;
    const fontSizes = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
    root.style.setProperty('--font-size', fontSizes[settings.fontSize]);

    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.setAttribute('data-spacing', settings.spacing);

    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.colorBlindMode) {
      root.classList.add('color-blind-mode');
    } else {
      root.classList.remove('color-blind-mode');
    }
  }, [settings]);

  const handleSettingsChange = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
  };

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const menuItems = [
    { icon: Home, title: 'Inicio', path: '/app/' },
    { icon: Plus, title: 'Nuevo Alquiler', path: '/app/nuevo-alquiler' },
    { icon: List, title: 'Ver Alquileres', path: '/app//alquileres' },
    { icon: Calendar, title: 'Calendario de vencimiento', path: '/app//calendario' },
    { icon: Package, title: 'Stock', path: '/app//stock' },
    { icon: Users, title: 'Clientes', path: '/app//clientes' },
    { icon: BarChart3, title: 'Estadísticas', path: '/app//estadisticas' },
  ];

  const currentPage = menuItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-gray-900 focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header role="banner" className="bg-gradient-to-br from-[#29a285] via-[#218a72] to-[#1b6f5c] text-white sticky top-0 z-40 shadow-md">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-3 -ml-2 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <div className="text-xs font-semibold opacity-80 tracking-wider">TUKI SYSTEM</div>
                <h1 className="text-xl font-bold">{currentPage?.title || 'Inicio'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label="Configuración de accesibilidad"
              >
                <Settings size={30} />
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors relative focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218a72]"
                aria-label={
                  unreadCount > 0
                    ? `Notificaciones, ${unreadCount} sin leer`
                    : 'Notificaciones, sin notificaciones nuevas'
                }
                aria-haspopup="dialog"
              >
                <Bell size={30} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#f5e663] text-[#1b6f5c] rounded-full flex items-center justify-center px-1 border-2 border-[#218a72]"
                    aria-hidden="true"
                  >
                    <span className="text-[10px] font-extrabold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
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
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    location.pathname === item.path
                      ? 'bg-white/20'
                      : 'hover:bg-white/10 focus:bg-white/10'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
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
    </div>
  );
}