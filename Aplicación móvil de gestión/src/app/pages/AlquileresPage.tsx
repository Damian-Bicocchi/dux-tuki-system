import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Search, Filter } from 'lucide-react';

interface Alquiler {
  id: number;
  cliente: string;
  equipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'vencido' | 'finalizado';
  precio: number;
}
function changeStateToFinalizado(id: number) {
   {"Aquí iría la lógica para cambiar el estado del alquiler a 'finalizado' en tu backend o estado global."}
}

export default function AlquileresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const alquileres: Alquiler[] = [
    { id: 1, cliente: 'Juan Pérez', equipo: 'Cámara Sony A7 III', fechaInicio: '2026-05-01', fechaFin: '2026-05-05', estado: 'activo', precio: 15000 },
    { id: 2, cliente: 'María González', equipo: 'Micrófono Rode NTG3', fechaInicio: '2026-04-25', fechaFin: '2026-05-01', estado: 'vencido', precio: 8000 },
    { id: 3, cliente: 'Carlos López', equipo: 'Kit de luces LED', fechaInicio: '2026-05-02', fechaFin: '2026-05-08', estado: 'activo', precio: 12000 },
    { id: 4, cliente: 'Ana Martínez', equipo: 'Trípode Manfrotto', fechaInicio: '2026-04-28', fechaFin: '2026-04-30', estado: 'finalizado', precio: 5000 },
  ];

  // Leer el filtro de la URL al cargar la página
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['activo', 'vencido', 'finalizado'].includes(filterParam)) {
      setFilterEstado(filterParam);
    }
  }, [searchParams]);

  // Actualizar la URL cuando cambia el filtro
  const handleFilterChange = (nuevoFiltro: string) => {
    setFilterEstado(nuevoFiltro);
    if (nuevoFiltro === 'todos') {
      // Si es "todos", eliminar el parámetro de la URL
      setSearchParams({});
    } else {
      // Si no, actualizar el parámetro filter
      setSearchParams({ filter: nuevoFiltro });
    }
  };

  const filteredAlquileres = alquileres.filter(alq => {
    const matchSearch = alq.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       alq.equipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterEstado === 'todos' || alq.estado === filterEstado;
    return matchSearch && matchFilter;
  });

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-300';
      case 'finalizado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="px-5 py-6">
      {/* Buscador y filtros */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o equipo..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Buscar alquileres"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" aria-hidden="true" />
          <select
            value={filterEstado}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="vencido">Vencidos</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>
      </div>

      {/* Lista de alquileres */}
      <div className="space-y-3 mb-24" 
        role="list">
        {filteredAlquileres.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron alquileres
          </div>
        ) : (
          filteredAlquileres.map(alq => (
            <article
              key={alq.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{alq.cliente}</h3>
                  <p className="text-sm text-gray-600">{alq.equipo}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 whitespace-nowrap ${getEstadoColor(alq.estado)}`}>
                  {alq.estado.charAt(0).toUpperCase() + alq.estado.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-semibold">Desde:</span> {new Date(alq.fechaInicio).toLocaleDateString('es-AR')}
                  {' - '}
                  <span className="font-semibold">Hasta:</span> {new Date(alq.fechaFin).toLocaleDateString('es-AR')}
                </div>
                <div className="text-gray-900 font-bold">
                    <button onClick={() => changeStateToFinalizado(alq.id)} className="text-[#218a72] hover:underline focus:underline">
                      Entregado
                    </button>
                </div>
                <div className="font-bold text-gray-900">
                  ${alq.precio.toLocaleString('es-AR')}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => navigate('/nuevo-alquiler')}
        className="fixed bottom-8 right-6 bg-[#f5e663] text-[#1b6f5c] rounded-full shadow-xl flex items-center justify-center gap-2 px-6 py-4 hover:scale-105 focus:scale-105 active:scale-95 transition-transform z-30 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#f5e663]/50"
        aria-label="Crear nuevo alquiler"
      >
        <Plus size={24} strokeWidth={2.5} />
        <span className="font-bold text-base">Nuevo alquiler</span>
      </button>
    </div>
  );
}