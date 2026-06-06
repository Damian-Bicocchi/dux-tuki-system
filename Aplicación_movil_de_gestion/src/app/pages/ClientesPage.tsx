import { useState, useRef, useEffect } from 'react';
import { Search, Mail, Phone, UserPlus, X, IdCard } from 'lucide-react';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  alquileres: number;
  ultimoAlquiler: string;
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', dni: '35123456', alquileres: 5, ultimoAlquiler: '2026-05-01' },
    { id: 2, nombre: 'María González', email: 'maria@email.com', dni: '38234567', alquileres: 3, ultimoAlquiler: '2026-04-25' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@email.com', dni: '32345678', alquileres: 8, ultimoAlquiler: '2026-05-02' },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@email.com', dni: '40456789', alquileres: 2, ultimoAlquiler: '2026-04-28' },
    { id: 5, nombre: 'Roberto Sánchez', email: 'roberto@email.com', dni: '28567890', alquileres: 12, ultimoAlquiler: '2026-05-03' },
  ]);

  const [formData, setFormData] = useState({ nombre: '', email: '', dni: '' });

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Manejo de foco: focus al abrir, trampa de teclado, Escape, restaurar al cerrar
  useEffect(() => {
    if (!showModal) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowModal(false); return; }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [showModal]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.dni.includes(searchTerm)
  );

  const handleRegistrarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.dni) return;

    const nuevoCliente: Cliente = {
      id: clientes.length + 1,
      nombre: formData.nombre,
      email: formData.email,
      dni: formData.dni,
      alquileres: 0,
      ultimoAlquiler: '-',
    };

    setClientes([...clientes, nuevoCliente]);
    setFormData({ nombre: '', email: '', dni: '' });
    setShowModal(false);
  };

  return (
    <div className="px-5 py-6 pb-24">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center">
          <div className="text-3xl font-extrabold text-blue-800 mb-1">{clientes.length}</div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Total clientes</div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 text-center">
          <div className="text-3xl font-extrabold text-purple-800 mb-1">
            {Math.round(clientes.reduce((sum, c) => sum + c.alquileres, 0) / clientes.length)}
          </div>
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wide">Promedio de alquileres por cliente</div>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-3">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No se encontraron clientes</div>
        ) : (
          filteredClientes.map(cliente => (
            <article
              key={cliente.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full bg-[#218a72] text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  {cliente.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-2">{cliente.nombre}</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <a
                        href={`mailto:${cliente.email}`}
                        className="hover:text-[#218a72] transition-colors truncate focus:outline-none focus:ring-2 focus:ring-[#218a72] focus:ring-offset-1 rounded"
                        aria-label={`Enviar email a ${cliente.nombre}: ${cliente.email}`}
                      >
                        {cliente.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IdCard size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">DNI: {cliente.dni}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-600">Alquileres:</span>
                  <span className="font-bold text-gray-900 ml-1">{cliente.alquileres}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Último:</span>
                  <span className="font-bold text-gray-900 ml-1">
                    {cliente.ultimoAlquiler === '-' ? '-' : new Date(cliente.ultimoAlquiler).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Botón flotante registrar */}
      <button
        ref={openButtonRef}
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#218a72] hover:bg-[#1b6f5c] text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 transition-all active:scale-95"
        aria-label="Registrar nuevo cliente"
        aria-haspopup="dialog"
      >
        <UserPlus size={24} aria-hidden="true" />
      </button>

      {/* Modal de registro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setShowModal(false)}
          />

          {/* Panel del diálogo */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registrar-cliente-titulo"
            className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="registrar-cliente-titulo" className="font-bold text-xl text-gray-900">
                Registrar cliente
              </h2>
              <button
                ref={closeButtonRef}
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
                aria-label="Cerrar formulario de registro de cliente"
              >
                <X size={20} className="text-gray-600" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleRegistrarCliente} className="space-y-4" aria-label="Formulario de nuevo cliente">
              <div>
                <label htmlFor="cliente-nombre" className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre completo <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cliente-nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="cliente-email" className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cliente-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: juan@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="cliente-dni" className="block text-sm font-bold text-gray-700 mb-2">
                  DNI <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cliente-dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                  placeholder="Ej: 35123456"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
                  required
                  aria-required="true"
                  maxLength={8}
                  inputMode="numeric"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#218a72] hover:bg-[#1b6f5c] text-white rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
