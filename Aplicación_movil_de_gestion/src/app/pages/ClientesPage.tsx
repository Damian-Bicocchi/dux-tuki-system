import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Mail, IdCard, UserPlus, ChevronRight } from 'lucide-react';
import { getClientes, type Cliente } from '../data/clientesData';

export default function ClientesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    setClientes(getClientes());
  }, []);

  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      cliente.dni.includes(term)
    );
  });

  const totalAlquileres = clientes.reduce((sum, c) => sum + c.alquileres.length, 0);
  const promedioAlquileres =
    clientes.length > 0 ? Math.round(totalAlquileres / clientes.length) : 0;

  return (
    <div className="px-5 py-6 pb-10">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-6" role="list" aria-label="Estadísticas de clientes">
        <div
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center"
          role="listitem"
          aria-label={`Total de clientes: ${clientes.length}`}
        >
          <div className="text-3xl font-extrabold text-blue-800 mb-1" aria-hidden="true">
            {clientes.length}
          </div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide" aria-hidden="true">
            Total clientes
          </div>
        </div>
        <div
          className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 text-center"
          role="listitem"
          aria-label={`Promedio de alquileres por cliente: ${promedioAlquileres}`}
        >
          <div className="text-3xl font-extrabold text-purple-800 mb-1" aria-hidden="true">
            {promedioAlquileres}
          </div>
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wide" aria-hidden="true">
            Prom. alquileres por cliente
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI o correo..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar clientes por nombre, DNI o correo"
          />
        </div>
      </div>

      {/* Botón registrar nuevo cliente */}
      <button
        onClick={() => navigate('/app/clientes/nuevo')}
        className="w-full flex items-center justify-center gap-2 py-3.5 mb-6 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
        aria-label="Registrar nuevo cliente"
      >
        <UserPlus size={20} aria-hidden="true" />
        <span>Registrar nuevo cliente</span>
      </button>

      {/* Lista de clientes */}
      <div
        className="space-y-3"
        role="list"
        aria-label={`${filteredClientes.length} cliente${filteredClientes.length !== 1 ? 's' : ''} encontrado${filteredClientes.length !== 1 ? 's' : ''}`}
      >
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500" role="listitem">
            No se encontraron clientes
          </div>
        ) : (
          filteredClientes.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => navigate(`/app/clientes/${cliente.id}`)}
              className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] hover:shadow-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/20"
              role="listitem"
              aria-label={`Ver detalle de ${cliente.nombre}, ${cliente.alquileres.length} alquileres`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-[#218a72] text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  {cliente.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{cliente.nombre}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={14} className="flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <IdCard size={14} className="flex-shrink-0" aria-hidden="true" />
                      <span>DNI: {cliente.dni}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-base">{cliente.alquileres.length}</div>
                    <div className="text-xs text-gray-500">alquileres</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
