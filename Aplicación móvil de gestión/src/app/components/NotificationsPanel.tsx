import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  DollarSign,
  Users,
  Bell,
  CheckCheck,
  MailOpen,
  Mail,
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  category: 'alquiler' | 'stock' | 'pago' | 'cliente' | 'sistema';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'error',
    category: 'alquiler',
    title: 'Alquiler vencido',
    description: 'Canon EOS R5 — Juan Pérez. Debía devolverse hace 2 días.',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    category: 'alquiler',
    title: 'Devolución pendiente',
    description: 'Micrófono Rode NT1 — Sofía Díaz. Vence hoy a las 18:00.',
    time: 'Hace 3 horas',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    category: 'stock',
    title: 'Stock bajo',
    description: 'Trípodes: solo 1 unidad disponible. Considerá reponer el inventario.',
    time: 'Hace 5 horas',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    category: 'pago',
    title: 'Pago recibido',
    description: '$15.000 cobrado a Carlos Rodríguez — Alquiler #0048.',
    time: 'Ayer, 14:32',
    read: false,
  },
  {
    id: '5',
    type: 'info',
    category: 'cliente',
    title: 'Nuevo cliente registrado',
    description: 'María González se registró y completó su primer alquiler.',
    time: 'Ayer, 10:15',
    read: true,
  },
  {
    id: '6',
    type: 'success',
    category: 'alquiler',
    title: 'Alquiler devuelto',
    description: 'Sony A7 III — Martín López devolvió el equipo en buen estado.',
    time: 'Hace 2 días',
    read: true,
  },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const typeConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    dot: 'bg-red-500',
    Icon: AlertTriangle,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    dot: 'bg-amber-500',
    Icon: Clock,
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    dot: 'bg-emerald-500',
    Icon: CheckCircle2,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    dot: 'bg-blue-500',
    Icon: Users,
  },
};

const categoryIcon = {
  alquiler: Clock,
  stock: Package,
  pago: DollarSign,
  cliente: Users,
  sistema: Bell,
};

export default function NotificationsPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Notificar cambios de contador al padre
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Focus al abrir
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape + trampa de foco
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // Nueva función: desmarcar como leída → vuelve a "sin leer"
  const markAsUnread = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const removeNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  if (!isOpen) return null;

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[88vh] flex flex-col"
        role="dialog"
        aria-labelledby="notifications-title"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#29a285] to-[#218a72] flex items-center justify-center"
              aria-hidden="true"
            >
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h2 id="notifications-title" className="font-bold text-gray-900 text-lg">
                Notificaciones
              </h2>
              {unreadCount > 0 ? (
                <p className="text-xs text-[#218a72] font-semibold">{unreadCount} sin leer</p>
              ) : (
                <p className="text-xs text-gray-500">Todo al día</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#218a72] hover:bg-emerald-50 focus:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218a72] focus:ring-offset-1"
                aria-label="Marcar todas las notificaciones como leídas"
              >
                <CheckCheck size={15} aria-hidden="true" />
                <span>Marcar todo</span>
              </button>
            )}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
              aria-label="Cerrar notificaciones"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Lista desplazable */}
        <div
          className="overflow-y-auto flex-1 pb-8"
          role="log"
          aria-live="polite"
          aria-label="Lista de notificaciones"
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#29a285]/10 to-[#218a72]/10 flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <Bell size={36} className="text-[#218a72] opacity-50" />
              </div>
              <p className="font-bold text-gray-700 text-base mb-2">Sin notificaciones</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Cuando haya novedades sobre alquileres, stock o clientes aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="px-4 pt-4 space-y-4">

              {/* ── Sin leer ── */}
              {unread.length > 0 && (
                <section aria-labelledby="unread-heading">
                  <h3
                    id="unread-heading"
                    className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1"
                  >
                    Sin leer
                  </h3>
                  <ul className="space-y-2.5" role="list">
                    {unread.map((notif) => {
                      const config = typeConfig[notif.type];
                      const CatIcon = categoryIcon[notif.category];
                      return (
                        <li key={notif.id} role="listitem">
                          <div
                            className={`relative rounded-2xl border-2 p-4 ${config.bg} ${config.border}`}
                          >
                            {/* Punto indicador */}
                            <span
                              className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${config.dot}`}
                              aria-hidden="true"
                            />

                            <div className="flex items-start gap-3.5 pr-5">
                              <div
                                className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                                aria-hidden="true"
                              >
                                <config.Icon size={18} className={config.iconColor} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm leading-snug mb-1">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed mb-2.5">
                                  {notif.description}
                                </p>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <CatIcon size={11} aria-hidden="true" />
                                    {notif.time}
                                  </span>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => markAsRead(notif.id)}
                                      className="flex items-center gap-1 text-xs font-semibold text-[#218a72] hover:text-[#1b6f5c] focus:text-[#1b6f5c] underline focus:outline-none focus:ring-1 focus:ring-[#218a72] rounded px-0.5"
                                      aria-label={`Marcar como leída: ${notif.title}`}
                                    >
                                      <MailOpen size={11} aria-hidden="true" />
                                      Marcar leída
                                    </button>
                                    <button
                                      onClick={() => removeNotification(notif.id)}
                                      className="text-xs font-semibold text-gray-400 hover:text-gray-600 focus:text-gray-600 underline focus:outline-none focus:ring-1 focus:ring-gray-400 rounded px-0.5"
                                      aria-label={`Descartar notificación: ${notif.title}`}
                                    >
                                      Descartar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* ── Leídas ── */}
              {read.length > 0 && (
                <section aria-labelledby="read-heading">
                  <h3
                    id="read-heading"
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1 mt-2"
                  >
                    Anteriores
                  </h3>
                  <ul className="space-y-2" role="list">
                    {read.map((notif) => {
                      const CatIcon = categoryIcon[notif.category];
                      return (
                        <li key={notif.id} role="listitem">
                          <div className="rounded-2xl border-2 border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-start gap-3.5">
                              <div
                                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              >
                                <CatIcon size={18} className="text-gray-400" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-500 text-sm leading-snug mb-1">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed mb-2.5">
                                  {notif.description}
                                </p>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <CatIcon size={11} aria-hidden="true" />
                                    {notif.time}
                                  </span>
                                  <div className="flex gap-3">
                                    {/* Botón para desmarcar como leída */}
                                    <button
                                      onClick={() => markAsUnread(notif.id)}
                                      className="flex items-center gap-1 text-xs font-semibold text-[#218a72] hover:text-[#1b6f5c] focus:text-[#1b6f5c] underline focus:outline-none focus:ring-1 focus:ring-[#218a72] rounded px-0.5"
                                      aria-label={`Marcar como no leída: ${notif.title}`}
                                    >
                                      <Mail size={11} aria-hidden="true" />
                                      No leída
                                    </button>
                                    <button
                                      onClick={() => removeNotification(notif.id)}
                                      className="text-xs font-semibold text-gray-400 hover:text-gray-600 focus:text-gray-600 underline focus:outline-none focus:ring-1 focus:ring-gray-400 rounded px-0.5"
                                      aria-label={`Descartar notificación: ${notif.title}`}
                                    >
                                      Descartar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Pie informativo */}
              <div className="pt-2 pb-2">
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Las notificaciones se generan según la actividad de alquileres, stock y clientes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de marca */}
        <div
          className="h-1.5 bg-gradient-to-r from-[#f5e663] via-[#f5e663]/80 to-[#218a72] flex-shrink-0"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
